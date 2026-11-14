import { describe, expect, it } from 'vitest'
import {
  filterSuggestions,
  HISTORY_MAX_BODY_LENGTH,
  historyEntry,
  indexSuggestions,
  normalizeTab,
  responseStatusColor,
  restDocsUrl,
  restRequestUrl,
  SEARCHABLE_BODY_LENGTH
} from '../../../src/helpers/rest'

const date = new Date()
const history = [
  { id: 1, method: 'GET', path: '_cat/indices', body: '', date },
  { id: 2, method: 'POST', path: 'logs/_search', body: '{"size":1}', date },
  { id: 3, method: 'GET', path: '_cat/indices', body: '', date }
]
const saved = [{ id: 1, name: 'Search logs', method: 'POST', path: 'logs/_search', body: '{"size":1}' }]
const index = indexSuggestions(history, saved)
const suggest = (query: string, limit?: number) => filterSuggestions(index, query, limit)

describe('restSuggestions', () => {
  it('lists saved queries first, then newest history, without duplicates', () => {
    expect(suggest('').map((s) => [s.source, s.method, s.path])).toEqual([
      ['saved', 'POST', 'logs/_search'],
      ['history', 'GET', '_cat/indices']
    ])
  })

  it('filters by path case-insensitively', () => {
    expect(suggest('CAT').map((s) => s.path)).toEqual(['_cat/indices'])
  })

  it('filters by method, body and saved name', () => {
    expect(suggest('post').map((s) => s.path)).toEqual(['logs/_search'])
    expect(suggest('"size"').map((s) => s.path)).toEqual(['logs/_search'])
    expect(suggest('search logs').map((s) => s.source)).toEqual(['saved'])
  })

  it('matches all whitespace separated terms in any order', () => {
    expect(suggest('cat indices').map((s) => s.path)).toEqual(['_cat/indices'])
    expect(suggest('  indices   GET ').map((s) => s.path)).toEqual(['_cat/indices'])
    expect(suggest('cat search')).toEqual([])
  })

  it('does not match the relative time of history entries', () => {
    expect(suggest('just now')).toEqual([])
  })

  it('shows the relative time as caption for history entries', () => {
    expect(suggest('cat')[0].caption).toBe('just now')
  })

  it('keeps method and body for applying a suggestion', () => {
    expect(suggest('logs')[0]).toMatchObject({ method: 'POST', body: '{"size":1}', caption: 'Search logs' })
  })

  it('only searches the start of large bodies', () => {
    const body = `${'x'.repeat(SEARCHABLE_BODY_LENGTH)}needle`
    const large = indexSuggestions([{ id: 1, method: 'POST', path: '_bulk', body, date }], [])

    expect(filterSuggestions(large, 'needle')).toEqual([])
    expect(filterSuggestions(large, '_bulk')[0].body).toBe(body)
  })

  it('respects the limit', () => {
    expect(suggest('', 1)).toHaveLength(1)
  })
})

describe('normalizeTab', () => {
  const request = { method: 'GET', path: '_cat/indices', body: '' }

  it('fills defaults for incomplete tabs', () => {
    expect(normalizeTab({ id: 1, label: '', request: undefined as never }, 2)).toEqual({
      id: 1,
      label: 'Tab 3',
      request: { method: 'POST', path: '', body: '' },
      response: { status: '', ok: false, bodyText: '', duration: undefined }
    })
  })

  it('uses the legacy inline response', () => {
    const tab = { id: 1, label: 'a', request, response: { status: '200 OK', ok: true, bodyText: '{}' } }
    expect(normalizeTab(tab, 0).response).toMatchObject({ status: '200 OK', bodyText: '{}' })
  })

  it('prefers the stored response record and drops its id', () => {
    const tab = { id: 1, label: 'a', request, response: { status: '500', ok: false, bodyText: 'old' } }
    const response = normalizeTab(tab, 0, { id: 1, status: '200 OK', ok: true, bodyText: 'new', duration: 5 }).response

    expect(response).toEqual({ status: '200 OK', ok: true, bodyText: 'new', duration: 5 })
  })
})

describe('historyEntry', () => {
  it('drops bodies of GET requests and huge bodies', () => {
    expect(historyEntry({ method: 'GET', path: 'a', body: '{}' }).body).toBe('')
    expect(historyEntry({ method: 'POST', path: 'a', body: 'x'.repeat(HISTORY_MAX_BODY_LENGTH + 1) }).body).toBe('')
    expect(historyEntry({ method: 'POST', path: 'a', body: '{}' }).body).toBe('{}')
  })
})

describe('restRequestUrl', () => {
  it('joins uri and path with exactly one slash', () => {
    expect(restRequestUrl('http://es:9200', '_cat/indices')).toBe('http://es:9200/_cat/indices')
    expect(restRequestUrl('http://es:9200/', '_cat/indices')).toBe('http://es:9200/_cat/indices')
    expect(restRequestUrl('http://es:9200', '/_cat/indices')).toBe('http://es:9200/_cat/indices')
  })
})

describe('restDocsUrl', () => {
  it('links the docs matching the cluster', () => {
    expect(restDocsUrl(false, '2.11.0')).toContain('opensearch.org')
    expect(restDocsUrl(true, '9.1.0')).toBe('https://www.elastic.co/docs/api/doc/elasticsearch')
    expect(restDocsUrl(true, '7.17.3')).toContain('/reference/7.17/')
    expect(restDocsUrl(true)).toContain('/reference/current/')
  })
})

describe('responseStatusColor', () => {
  it('maps status classes to colors', () => {
    expect(['200 OK', '301', '404 Not Found', '503', ''].map(responseStatusColor)).toEqual([
      'positive',
      'warning',
      'warning',
      'negative',
      'grey'
    ])
  })
})
