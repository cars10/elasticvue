import { describe, expect, it } from 'vitest'
import { defaultSqlQuery, sqlBody, sqlPage } from '../../../src/helpers/search/sql'
import {
  sameSearch,
  searchEntry,
  SEARCH_QUERY_MAX_LENGTH,
  type SearchEntryState
} from '../../../src/helpers/search/searchLibrary'

describe('sqlBody', () => {
  it('pages sql with fetch_size and cursors', () => {
    const xpack = { path: '_xpack/sql', format: 'json' }
    const sql = { path: '_sql', format: 'json', params: { field_multi_value_leniency: true } }
    expect(sqlBody(xpack, 'sql', 'SELECT 1')).toEqual({ query: 'SELECT 1', fetch_size: 100 })
    expect(sqlBody(sql, 'sql', 'SELECT 1')).toEqual({ query: 'SELECT 1', fetch_size: 100, field_multi_value_leniency: true })
    expect(sqlBody(sql, 'sql', 'SELECT 1', 'abc')).toEqual({ cursor: 'abc' })
    expect(sqlBody({ path: '_query', format: 'json' }, 'esql', 'FROM a')).toEqual({ query: 'FROM a' })
  })
})

describe('sqlPage', () => {
  it('normalizes elasticsearch sql, opensearch jdbc and ES|QL responses', () => {
    expect(sqlPage({ columns: [{ name: 'a' }], rows: [[1]], cursor: 'c' })).toEqual({ columns: ['a'], rows: [[1]], cursor: 'c' })
    expect(sqlPage({ rows: [[2]] })).toEqual({ columns: null, rows: [[2]], cursor: null })
    expect(sqlPage({ schema: [{ name: 'count(*)', alias: 'c' }, { name: 'b' }], datarows: [[3, 'x']] })).toEqual({
      columns: ['c', 'b'],
      rows: [[3, 'x']],
      cursor: null
    })
    expect(sqlPage({ columns: [{ name: 'level' }], values: [['error']] })).toEqual({
      columns: ['level'],
      rows: [['error']],
      cursor: null
    })
  })

  it('builds default queries from the selected targets', () => {
    expect(defaultSqlQuery('sql', ['logs-*', 'movies'])).toBe('SELECT *\nFROM "logs-*,movies"\nLIMIT 100')
    expect(defaultSqlQuery('esql', ['logs-*', 'movies'])).toBe('FROM logs-*,movies\n| LIMIT 100')
    expect(defaultSqlQuery('sql', ['a', 'b'], false)).toBe('SELECT *\nFROM a,b\nLIMIT 100')
  })
})

describe('search library entries', () => {
  const state: SearchEntryState = {
    targets: ['movies'],
    mode: 'query',
    q: 'title:Alien',
    dslBody: '{}',
    sqlQuery: 'SELECT 1',
    esqlQuery: '',
    filters: [{ field: 'year', op: 'exists' }],
    timeRange: { from: 'now-1h', to: 'now' },
    timeField: '@timestamp',
    columns: ['_id', 'title']
  }

  it('stores the query of the current mode and drops query-only state for other modes', () => {
    expect(searchEntry(state)).toMatchObject({
      targets: ['movies'],
      mode: 'query',
      query: 'title:Alien',
      filters: [{ field: 'year', op: 'exists' }],
      timeRange: { from: 'now-1h', to: 'now' },
      timeField: '@timestamp',
      columns: ['_id', 'title']
    })
    const sql = searchEntry({ ...state, mode: 'sql' })!
    expect(sql).toMatchObject({ mode: 'sql', query: 'SELECT 1', filters: [], timeRange: null })
    expect(sql).not.toHaveProperty('timeField')
  })

  it('skips huge queries and detects repeated searches', () => {
    expect(searchEntry({ ...state, q: 'x'.repeat(SEARCH_QUERY_MAX_LENGTH + 1) })).toBeNull()
    const a = searchEntry(state)!
    const b = { ...searchEntry(state)!, date: new Date(0), columns: ['other'], id: 5 }
    expect(sameSearch(a, b)).toBe(true)
    expect(sameSearch(a, searchEntry({ ...state, q: 'other' })!)).toBe(false)
    expect(sameSearch(undefined, a)).toBe(false)
  })
})
