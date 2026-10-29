import { describe, expect, it } from 'vitest'
import { buildSearchBody, sortClause } from '../../../src/helpers/search/buildSearchBody'

const base = { q: '*', page: 1, size: 10, majorVersion: 8 }

describe('buildSearchBody', () => {
  it('uses match_all for empty and * queries', () => {
    expect(buildSearchBody(base).query).toEqual({ match_all: {} })
    expect(buildSearchBody({ ...base, q: '  ' }).query).toEqual({ match_all: {} })
  })

  it('uses query_string without a fields list', () => {
    expect(buildSearchBody({ ...base, q: 'status:500' }).query).toEqual({
      bool: { must: [{ query_string: { query: 'status:500' } }] }
    })
  })

  it('computes pagination', () => {
    expect(buildSearchBody({ ...base, page: 3, size: 20 })).toMatchObject({ from: 40, size: 20, sort: [] })
  })

  it('adds filters, negated filters and time range as bool filter clauses', () => {
    const body = buildSearchBody({
      ...base,
      q: 'error',
      filters: [
        { field: 'service', op: 'is', value: 'api' },
        { field: 'level', op: 'is', value: 'debug', negate: true },
        { field: 'user', op: 'exists' },
        { field: 'bytes', op: 'between', value: '10', to: '20' },
        { field: 'ignored', op: 'is', value: 'x', disabled: true }
      ],
      time: { field: '@timestamp', from: 'now-15m', to: 'now' }
    })

    expect(body.query).toEqual({
      bool: {
        must: [{ query_string: { query: 'error' } }],
        filter: [
          { match_phrase: { service: 'api' } },
          { exists: { field: 'user' } },
          { range: { bytes: { gte: '10', lte: '20' } } },
          { range: { '@timestamp': { gte: 'now-15m', lte: 'now', format: 'strict_date_optional_time||epoch_millis' } } }
        ],
        must_not: [{ match_phrase: { level: 'debug' } }]
      }
    })
  })

  it('puts filters into must on elasticsearch 1.x and wraps exists in constant_score', () => {
    const body = buildSearchBody({
      ...base,
      majorVersion: 1,
      filters: [
        { field: 'a', op: 'exists' },
        { field: 'b', op: 'exists', negate: true }
      ]
    })
    expect(body.query).toEqual({
      bool: {
        must: [{ constant_score: { filter: { exists: { field: 'a' } } } }],
        must_not: [{ constant_score: { filter: { exists: { field: 'b' } } } }]
      }
    })
  })

  it('negates ranges and limits _source when asked', () => {
    const body = buildSearchBody({
      ...base,
      filters: [{ field: 'bytes', op: 'between', value: '10', negate: true }],
      source: ['title', 'year']
    })
    expect(body.query).toEqual({ bool: { must_not: [{ range: { bytes: { gte: '10' } } }] } })
    expect(body._source).toEqual(['title', 'year'])
    expect(buildSearchBody(base)).not.toHaveProperty('_source')
  })

  it('sends the time range without a date format on elasticsearch 1.x', () => {
    const time = { field: 'ts', from: '2024-01-01T00:00:00.000Z', to: 'now' }
    expect(buildSearchBody({ ...base, majorVersion: 1, time }).query).toEqual({
      bool: { must: [{ range: { ts: { gte: '2024-01-01T00:00:00.000Z', lte: 'now' } } }] }
    })
  })

  it('only sends track_total_hits for exact totals on elasticsearch 7+', () => {
    expect(buildSearchBody({ ...base, exactTotal: true })).toHaveProperty('track_total_hits', true)
    expect(buildSearchBody({ ...base, exactTotal: true, majorVersion: 6 })).not.toHaveProperty('track_total_hits')
    expect(buildSearchBody(base)).not.toHaveProperty('track_total_hits')
  })

  it('sorts with unmapped_type so indices without the field do not fail', () => {
    const sort = { field: 'title.keyword', descending: true, unmappedType: 'keyword' }
    expect(buildSearchBody({ ...base, sort }).sort).toEqual([{ 'title.keyword': { order: 'desc', unmapped_type: 'keyword' } }])
  })
})

describe('sortClause', () => {
  it('handles meta fields and old versions', () => {
    expect(sortClause({ field: '_id', descending: false, unmappedType: 'keyword' })).toEqual({ _id: { order: 'asc' } })
    expect(sortClause({ field: 'age', descending: false, unmappedType: 'long' })).toEqual({
      age: { order: 'asc', unmapped_type: 'long' }
    })
    expect(sortClause({ field: 'age', descending: false })).toEqual({ age: { order: 'asc' } })
  })
})
