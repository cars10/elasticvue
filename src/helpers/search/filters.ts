import type { SearchFilter } from '../../types/search.ts'

export const filterLabel = ({ field, op, value, to, negate }: SearchFilter) => {
  const not = negate ? 'NOT ' : ''
  if (op === 'exists') return `${not}${field} exists`
  if (op === 'between') return `${not}${field}: ${value || '…'} – ${to || '…'}`
  return `${not}${field}: ${value ?? ''}`
}

export const isCompleteFilter = ({ field, op, value, to }: SearchFilter) => {
  if (!field) return false
  if (op === 'is') return !!value
  if (op === 'between') return !!value || !!to
  return true
}

const OPS = ['is', 'exists', 'between']
const optionalString = (value: unknown) => value === undefined || typeof value === 'string'

export const parseFilters = (json: string): SearchFilter[] => {
  try {
    const parsed: unknown = JSON.parse(json)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (filter): filter is SearchFilter =>
        typeof filter === 'object' &&
        filter !== null &&
        typeof filter.field === 'string' &&
        OPS.includes(filter.op) &&
        optionalString(filter.value) &&
        optionalString(filter.to) &&
        isCompleteFilter(filter)
    )
  } catch (_e) {
    return []
  }
}
