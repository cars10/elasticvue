import { timeRangeClause } from './buildSearchBody.ts'
import type { SearchCapabilities } from '../capabilities.ts'
import type { SearchTimeRange } from '../../types/search.ts'

export const FIELD_VALUES_TIMEOUT = '2s'
export const FIELD_VALUES_MAX_DOCS_PER_SHARD = 100_000

type FieldValuesOptions = {
  field: string
  time?: SearchTimeRange | null
  capabilities: Pick<SearchCapabilities, 'boolFilter' | 'terminateAfter'>
}

export const fieldValuesBody = ({ field, time, capabilities }: FieldValuesOptions): Record<string, unknown> => ({
  size: 0,
  timeout: FIELD_VALUES_TIMEOUT,
  ...(capabilities.terminateAfter && { terminate_after: FIELD_VALUES_MAX_DOCS_PER_SHARD }),
  ...(time && { query: timeRangeClause(time, capabilities.boolFilter) }),
  aggs: { values: { terms: { field, size: 10 } } }
})
