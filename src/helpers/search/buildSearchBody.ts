import type { SearchBodyOptions, SearchFilter, SearchSort, SearchTimeRange } from '../../types/search.ts'

const filterClause = ({ field, op, value, to }: SearchFilter, boolFilter: boolean) => {
  switch (op) {
    case 'exists':
      return boolFilter ? { exists: { field } } : { constant_score: { filter: { exists: { field } } } }
    case 'between':
      return { range: { [field]: { ...(value && { gte: value }), ...(to && { lte: to }) } } }
    default:
      return { match_phrase: { [field]: value } }
  }
}

export const timeRangeClause = ({ field, from, to }: SearchTimeRange, boolFilter: boolean) => {
  const format = boolFilter ? { format: 'strict_date_optional_time||epoch_millis' } : {}
  return { range: { [field]: { gte: from, lte: to, ...format } } }
}

export const sortClause = ({ field, descending, unmappedType }: SearchSort) => {
  const order = descending ? 'desc' : 'asc'
  if (!unmappedType || field.startsWith('_')) return { [field]: { order } }
  return { [field]: { order, unmapped_type: unmappedType } }
}

export const buildSearchBody = ({
  q,
  filters = [],
  source,
  time,
  sort,
  page,
  size,
  exactTotal,
  capabilities: { boolFilter, trackTotalHits }
}: SearchBodyOptions): Record<string, unknown> => {
  const query = q.trim()
  const active = filters.filter((filter) => !filter.disabled)

  const must: object[] = query && query !== '*' ? [{ query_string: { query } }] : []
  const filter: object[] = active.filter((f) => !f.negate).map((f) => filterClause(f, boolFilter))
  const mustNot: object[] = active.filter((f) => f.negate).map((f) => filterClause(f, boolFilter))
  if (time) filter.push(timeRangeClause(time, boolFilter))

  const clauses = boolFilter ? { must, filter } : { must: [...must, ...filter] }
  const hasClauses = must.length + filter.length + mustNot.length > 0
  const bool = Object.fromEntries(
    Object.entries({ ...clauses, must_not: mustNot }).filter(([, list]) => (list as object[]).length > 0)
  )

  return {
    query: hasClauses ? { bool } : { match_all: {} },
    from: (page - 1) * size,
    size,
    sort: sort ? [sortClause(sort)] : [],
    ...(source != null && { _source: source }),
    ...(exactTotal && trackTotalHits && { track_total_hits: true })
  }
}
