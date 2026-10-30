import { describe, expect, it } from 'vitest'
import {
  documentFields,
  flattenDocument,
  formatFieldValue,
  getFieldValue,
  summarizeDocument
} from '../../../src/helpers/search/documentValues'
import { columnOptions, defaultColumns, rememberColumns, targetKey } from '../../../src/helpers/search/columns'
import { migrateSearchState } from '../../../src/services/migrations'
import { DEFAULT_SEARCH_QUERY } from '../../../src/consts'

describe('documentValues', () => {
  const doc = {
    title: 'Up',
    'flat.key': 1,
    user: { name: 'ann', tags: ['a'] },
    items: [{ id: 1 }, { id: 2 }],
    empty: {},
    nothing: null
  }

  it('flattens nested objects to dotted paths', () => {
    expect(flattenDocument(doc)).toEqual({
      title: 'Up',
      'flat.key': 1,
      'user.name': 'ann',
      'user.tags': ['a'],
      items: [{ id: 1 }, { id: 2 }],
      empty: {},
      nothing: null
    })
  })

  it('keeps mapped object fields and nested arrays as one column', () => {
    const docs = [
      { loc: { lat: 1, lon: 2 }, attrs: { color: 'red' }, comments: [{ author: 'a' }], user: { name: 'n' } },
      { loc: { lat: 3, lon: 4 }, attrs: { size: 'L' }, comments: { author: 'b' }, user: { age: 3 } }
    ]
    const mapped = new Set(['loc', 'attrs', 'comments.author', 'user.name', 'user.age'])
    expect(documentFields(docs, (path) => mapped.has(path))).toEqual(['loc', 'attrs', 'comments', 'user.name', 'user.age'])
  })

  it('looks up dotted paths in nested objects, arrays and flat keys', () => {
    expect(getFieldValue(doc, 'user.name')).toBe('ann')
    expect(getFieldValue(doc, 'flat.key')).toBe(1)
    expect(getFieldValue(doc, 'items.id')).toEqual([1, 2])
    expect(getFieldValue(doc, 'missing.path')).toBeUndefined()
    expect(getFieldValue(doc, 'nothing')).toBeNull()
  })

  it('formats values for table cells', () => {
    expect(formatFieldValue(undefined)).toBe('')
    expect(formatFieldValue(null)).toBe('null')
    expect(formatFieldValue({ a: 1 })).toBe('{"a":1}')
    expect(formatFieldValue(['a, b', 'c'])).toBe('["a, b","c"]')
    expect(formatFieldValue(3)).toBe('3')
  })

  it('summarizes documents and truncates', () => {
    expect(summarizeDocument({ a: 1, b: { c: 'x' } }, 100)).toBe('a: 1 · b.c: x')
    expect(summarizeDocument({ a: 'x'.repeat(50) }, 10)).toBe('a: xxxxxxx…')
  })
})

describe('columns', () => {
  it('builds a stable key per target set', () => {
    expect(targetKey(['recipes', ' movies '])).toBe('movies,recipes')
    expect(targetKey([])).toBe('*')
  })

  it('remembers columns per target set with a limit', () => {
    let memory = rememberColumns({}, 'a', ['x'], 2)
    memory = rememberColumns(memory, 'b', ['y'], 2)
    memory = rememberColumns(memory, 'a', ['z'], 2)
    memory = rememberColumns(memory, 'c', ['w'], 2)
    expect(memory).toEqual({ a: ['z'], c: ['w'] })
  })

  it('defaults to _index, _id and the first fields seen on the page', () => {
    const seen = Array.from({ length: 20 }, (_, i) => `f${i}`)
    expect(defaultColumns(['title', '_ignored', 'year'])).toEqual(['_index', '_id', 'title', 'year'])
    expect(defaultColumns(seen)).toHaveLength(14)
  })

  it('lists meta, mapped and unmapped fields', () => {
    const catalog = {
      year: { name: 'year', types: ['long'], indices: 1, partial: true, aggregatable: true, sortField: 'year' },
      title: { name: 'title', types: ['text'], indices: null, partial: false, aggregatable: false, sortField: null },
      'title.keyword': {
        name: 'title.keyword',
        types: ['keyword'],
        indices: null,
        partial: false,
        aggregatable: true,
        subField: true,
        sortField: 'title.keyword'
      }
    }
    const options = columnOptions(catalog, ['title', 'runtime_field', '_ignored'], 6)

    expect(options.map((o) => [o.name, o.group])).toEqual([
      ['_index', 'meta'],
      ['_type', 'meta'],
      ['_id', 'meta'],
      ['_score', 'meta'],
      ['_source', 'meta'],
      ['title', 'all'],
      ['year', 'some'],
      ['runtime_field', 'unmapped']
    ])
  })
})

describe('migrateSearchState', () => {
  it('converts old index patterns and selections to targets', () => {
    expect(migrateSearchState({ indices: 'movies*, recipes', q: 'x' })).toMatchObject({
      targets: ['movies*', 'recipes'],
      q: 'x',
      mode: 'query'
    })
    expect(migrateSearchState({ indices: ['a', 'b'] })).toMatchObject({ targets: ['a', 'b'] })
    expect(migrateSearchState({ indices: '' })).toMatchObject({ targets: ['*'] })
  })

  it('keeps customized queries as dsl mode and drops legacy keys', () => {
    const migrated = migrateSearchState({
      indices: '*',
      searchQuery: '{"query":{"term":{"a":1}}}',
      searchQueryCollapsed: true,
      filter: 'x',
      columns: ['a'],
      visibleColumns: ['a'],
      stickyTableHeader: true
    })

    expect(migrated).toEqual({
      targets: ['*'],
      mode: 'dsl',
      dslBody: '{"query":{"term":{"a":1}}}',
      stickyTableHeader: true
    })
  })

  it('resets page sizes the new table does not offer', () => {
    const pagination = { sortBy: 'year', descending: true, page: 4, rowsPerPage: 10000 }
    expect(migrateSearchState({ indices: '*', pagination })?.pagination).toEqual({ ...pagination, rowsPerPage: 10 })
    expect(migrateSearchState({ indices: '*', pagination: { rowsPerPage: 100 } })?.pagination).toEqual({ rowsPerPage: 100 })
  })

  it('ignores the default query and already migrated state', () => {
    expect(migrateSearchState({ indices: '*', searchQuery: DEFAULT_SEARCH_QUERY, searchQueryCollapsed: true })).toMatchObject({
      mode: 'query',
      dslBody: ''
    })
    expect(migrateSearchState({ targets: ['*'] })).toBeNull()
  })
})
