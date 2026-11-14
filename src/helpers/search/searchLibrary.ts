import type { IdbSearchEntry } from '../../db/types.ts'
import type { SearchFilter, SearchMode, SearchTimeBounds } from '../../types/search.ts'

export const SEARCH_HISTORY_LIMIT = 100
export const SEARCH_QUERY_MAX_LENGTH = 100_000

export type SearchEntryState = {
  targets: string[]
  mode: SearchMode
  q: string
  dslBody: string
  sqlQuery: string
  esqlQuery: string
  filters: SearchFilter[]
  timeRange: SearchTimeBounds | null
  timeField?: string
  columns?: string[]
}

const QUERY_KEYS = { query: 'q', dsl: 'dslBody', sql: 'sqlQuery', esql: 'esqlQuery' } as const

export const queryKeyFor = (mode: SearchMode) => QUERY_KEYS[mode]

export const searchEntry = (state: SearchEntryState): IdbSearchEntry | null => {
  const query = state[queryKeyFor(state.mode)]
  if (query.length > SEARCH_QUERY_MAX_LENGTH) return null

  const isQuery = state.mode === 'query'
  return {
    date: new Date(),
    targets: [...state.targets],
    mode: state.mode,
    query,
    filters: isQuery ? state.filters.map((filter) => ({ ...filter })) : [],
    timeRange: isQuery && state.timeRange ? { ...state.timeRange } : null,
    ...(isQuery && state.timeField && { timeField: state.timeField }),
    ...(state.columns && { columns: [...state.columns] })
  }
}

const comparable = ({ targets, mode, query, filters, timeRange, timeField }: IdbSearchEntry) =>
  JSON.stringify({ targets, mode, query, filters, timeRange, timeField })

export const sameSearch = (a?: IdbSearchEntry, b?: IdbSearchEntry) => !!a && !!b && comparable(a) === comparable(b)

export const entryText = (entry: IdbSearchEntry) =>
  [entry.name, entry.mode, entry.targets.join(','), entry.query, ...entry.filters.map((filter) => filter.field)]
    .filter(Boolean)
    .join(' ')
