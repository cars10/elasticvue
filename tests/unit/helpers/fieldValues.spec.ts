import { describe, expect, it } from 'vitest'
import { FIELD_VALUES_MAX_DOCS_PER_SHARD, FIELD_VALUES_TIMEOUT, fieldValuesBody } from '../../../src/helpers/search/fieldValues'

describe('fieldValuesBody', () => {
  it('bounds the aggregation with a timeout and terminate_after', () => {
    expect(fieldValuesBody({ field: 'status', capabilities: { boolFilter: true, terminateAfter: true } })).toEqual({
      size: 0,
      timeout: FIELD_VALUES_TIMEOUT,
      terminate_after: FIELD_VALUES_MAX_DOCS_PER_SHARD,
      aggs: { values: { terms: { field: 'status', size: 10 } } }
    })
  })

  it('restricts the aggregation to the active time range', () => {
    const body = fieldValuesBody({
      field: 'status',
      time: { field: '@timestamp', from: 'now-15m', to: 'now' },
      capabilities: { boolFilter: true, terminateAfter: true }
    })

    expect(body.query).toEqual({
      range: { '@timestamp': { gte: 'now-15m', lte: 'now', format: 'strict_date_optional_time||epoch_millis' } }
    })
  })

  it('omits terminate_after and the date format on elasticsearch 1', () => {
    const body = fieldValuesBody({
      field: 'status',
      time: { field: 'date', from: 'now-1h', to: 'now' },
      capabilities: { boolFilter: false, terminateAfter: false }
    })

    expect('terminate_after' in body).toBe(false)
    expect(body.query).toEqual({ range: { date: { gte: 'now-1h', lte: 'now' } } })
  })
})
