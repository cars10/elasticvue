import type { SearchBodyOptions, SearchFilter, SearchSort } from '../../types/search.ts'

const filterClause = ({ field, op, value, to }: SearchFilter, majorVersion: number) => {
  switch (op) {
    case 'exists':
      return majorVersion >= 2 ? { exists: { field } } : { constant_score: { filter: { exists: { field } } } }
    case 'between':
      return { range: { [field]: { ...(value && { gte: value }), ...(to && { lte: to }) } } }
    default:
      return { match_phrase: { [field]: value } }
  }
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
  majorVersion
}: SearchBodyOptions): Record<string, unknown> => {
  const query = q.trim()
  const active = filters.filter((filter) => !filter.disabled)

  const must: object[] = query && query !== '*' ? [{ query_string: { query } }] : []
  const filter: object[] = active.filter((f) => !f.negate).map((f) => filterClause(f, majorVersion))
  const mustNot: object[] = active.filter((f) => f.negate).map((f) => filterClause(f, majorVersion))
  if (time) {
    const format = majorVersion >= 2 ? { format: 'strict_date_optional_time||epoch_millis' } : {}
    filter.push({ range: { [time.field]: { gte: time.from, lte: time.to, ...format } } })
  }

  const clauses = majorVersion >= 2 ? { must, filter } : { must: [...must, ...filter] }
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
    ...(exactTotal && majorVersion >= 7 && { track_total_hits: true })
  }
}
