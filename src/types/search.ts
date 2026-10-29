export type SearchMode = 'query' | 'dsl' | 'sql' | 'esql'

export type SearchFilterOp = 'is' | 'exists' | 'between'

export type SearchFilter = {
  field: string
  op: SearchFilterOp
  value?: string
  to?: string
  negate?: boolean
  disabled?: boolean
}

export type SearchTimeBounds = {
  from: string
  to: string
}

export type SearchTimeRange = SearchTimeBounds & {
  field: string
}

export type SearchSort = {
  field: string
  descending: boolean
  unmappedType?: string
}

export type SearchBodyOptions = {
  q: string
  filters?: SearchFilter[]
  source?: string[] | false | null
  time?: SearchTimeRange | null
  sort?: SearchSort | null
  page: number
  size: number
  exactTotal?: boolean
  majorVersion: number
}

export type FieldInfo = {
  name: string
  types: string[]
  indices: number | null
  partial: boolean
  aggregatable: boolean
  subField?: boolean
  sortField: string | null
}

export type FieldCatalog = Record<string, FieldInfo>

export type EsFieldCapsResponse = {
  indices?: string[]
  fields: Record<string, Record<string, { type: string; aggregatable?: boolean; indices?: string[] }>>
}

export type EsMappingProperty = {
  type?: string
  index?: string | boolean
  properties?: Record<string, EsMappingProperty>
  fields?: Record<string, EsMappingProperty>
}
