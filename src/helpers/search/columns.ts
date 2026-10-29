import type { FieldCatalog } from '../../types/search.ts'

export const SOURCE_COLUMN = '_source'
export const DEFAULT_META_COLUMNS = ['_index', '_id']
export const DEFAULT_FIELD_COLUMNS = 12
export const COLUMN_MEMORY_LIMIT = 20

export type ColumnGroup = 'meta' | 'all' | 'some' | 'unmapped'

export type ColumnOption = {
  name: string
  group: ColumnGroup
  indices: number | null
}

export const metaColumns = (majorVersion: number) => [
  '_index',
  ...(majorVersion > 0 && majorVersion < 7 ? ['_type'] : []),
  '_id',
  '_score',
  SOURCE_COLUMN
]

export const targetKey = (targets: string[]) =>
  targets
    .map((target) => target.trim())
    .filter(Boolean)
    .sort()
    .join(',') || '*'

export const defaultColumns = (seenFields: string[]) => [
  ...DEFAULT_META_COLUMNS,
  ...seenFields.filter((name) => !name.startsWith('_')).slice(0, DEFAULT_FIELD_COLUMNS)
]

export const rememberColumns = <T>(
  memory: Record<string, T>,
  key: string,
  columns: T,
  limit = COLUMN_MEMORY_LIMIT
): Record<string, T> => {
  const rest = Object.fromEntries(Object.entries(memory).filter(([k]) => k !== key))
  const entries = [...Object.entries(rest), [key, columns] as [string, T]]
  return Object.fromEntries(entries.slice(-limit))
}

export const columnOptions = (catalog: FieldCatalog, seenFields: string[], majorVersion: number): ColumnOption[] => {
  const meta = metaColumns(majorVersion).map((name): ColumnOption => ({ name, group: 'meta', indices: null }))
  const mapped = Object.values(catalog)
    .filter((field) => !field.subField)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((field): ColumnOption => ({ name: field.name, group: field.partial ? 'some' : 'all', indices: field.indices }))
  const unmapped = seenFields
    .filter((name) => !catalog[name] && !name.startsWith('_'))
    .sort()
    .map((name): ColumnOption => ({ name, group: 'unmapped', indices: null }))

  return [...meta, ...mapped, ...unmapped]
}
