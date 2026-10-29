import type { EsFieldCapsResponse, EsMappingProperty, FieldCatalog, FieldInfo } from '../../types/search.ts'

// Null prototype, so fields named like constructor or __proto__ do not hit Object.prototype
export const emptyCatalog = (): FieldCatalog => Object.create(null)

const PARENT_TYPES = ['object', 'nested']
const UNMAPPED = 'unmapped'

const isSortable = (field?: FieldInfo) => !!field && field.aggregatable && field.types.length === 1

const parentOf = (name: string) => name.slice(0, name.lastIndexOf('.'))

const withSortFields = (catalog: FieldCatalog): FieldCatalog => {
  const children = new Map<string, FieldInfo[]>()
  Object.values(catalog).forEach((field) => {
    if (!field.name.includes('.')) return
    const parent = parentOf(field.name)
    children.set(parent, [...(children.get(parent) ?? []), field])
  })

  const sortableFor = (name: string): string | null => {
    if (isSortable(catalog[name])) return name
    if (isSortable(catalog[`${name}.keyword`])) return `${name}.keyword`
    return children.get(name)?.find(isSortable)?.name ?? null
  }

  Object.values(catalog).forEach((field) => {
    field.sortField = sortableFor(field.name)
    field.subField = field.name.includes('.') && !!catalog[parentOf(field.name)]
  })
  return catalog
}

export const catalogFromFieldCaps = (response: EsFieldCapsResponse): FieldCatalog => {
  const catalog = emptyCatalog()

  Object.entries(response.fields || {}).forEach(([name, byType]) => {
    if (name.startsWith('_')) return

    const entries = Object.values(byType)
    const types = entries.map((e) => e.type).filter((type) => type !== UNMAPPED)
    if (types.length === 0 || types.every((type) => PARENT_TYPES.includes(type))) return

    const mapped = entries.filter((e) => e.type !== UNMAPPED)
    const partial = entries.some((e) => e.type === UNMAPPED)
    const indices = partial ? mapped.reduce((count, e) => count + (e.indices?.length || 0), 0) : null

    catalog[name] = {
      name,
      types,
      indices,
      partial,
      aggregatable: mapped.every((e) => e.aggregatable !== false),
      sortField: null
    }
  })

  return withSortFields(catalog)
}

const isAggregatable = (property: EsMappingProperty) => {
  if (property.type !== 'string' && property.type !== 'text') return true
  return property.index === 'not_analyzed'
}

const walkProperties = (
  properties: Record<string, EsMappingProperty>,
  prefix: string,
  visit: (name: string, property: EsMappingProperty) => void
) => {
  Object.entries(properties || {}).forEach(([key, property]) => {
    const name = prefix + key
    if (property.properties) walkProperties(property.properties, `${name}.`, visit)
    if (property.type && !PARENT_TYPES.includes(property.type)) visit(name, property)
    Object.entries(property.fields || {}).forEach(([sub, subProperty]) => visit(`${name}.${sub}`, subProperty))
  })
}

const mappingProperties = (mappings: Record<string, any>): Record<string, EsMappingProperty>[] => {
  if (!mappings) return []
  if (mappings.properties) return [mappings.properties]
  return Object.values(mappings)
    .map((typeMapping: any) => typeMapping?.properties)
    .filter(Boolean)
}

export const catalogFromMappings = (response: Record<string, { mappings?: Record<string, any> }>): FieldCatalog => {
  const seen: Record<string, { types: Set<string>; indices: Set<string>; aggregatable: boolean }> = Object.create(null)
  const indexNames = Object.keys(response || {})

  indexNames.forEach((index) => {
    mappingProperties(response[index].mappings || {}).forEach((properties) =>
      walkProperties(properties, '', (name, property) => {
        const entry = (seen[name] ||= { types: new Set(), indices: new Set(), aggregatable: true })
        entry.types.add(property.type!)
        entry.indices.add(index)
        entry.aggregatable &&= isAggregatable(property)
      })
    )
  })

  const catalog = emptyCatalog()
  Object.entries(seen).forEach(([name, entry]) => {
    const partial = entry.indices.size < indexNames.length
    catalog[name] = {
      name,
      types: [...entry.types],
      indices: partial ? entry.indices.size : null,
      partial,
      aggregatable: entry.aggregatable,
      sortField: null
    }
  })

  return withSortFields(catalog)
}

export const unmappedTypeFor = (field: FieldInfo | undefined, majorVersion: number) => {
  const type = field?.types[0]
  if (!type) return undefined
  if (majorVersion < 5 && (type === 'keyword' || type === 'text')) return 'string'
  return type
}
