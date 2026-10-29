import { Page, Route } from '@playwright/test'

type Doc = { _index: string; _id: string; _routing?: string; _source?: Record<string, unknown>; fields?: Record<string, unknown> }

export type SearchBody = {
  query?: { bool?: { must?: { query_string?: { query?: string } }[] } }
  sort?: Record<string, { order: string }>[]
  from?: number
  size?: number
  track_total_hits?: boolean
  aggs?: {
    min?: unknown
    values?: { terms: { field: string; size: number } }
    histogram?: {
      date_histogram: {
        field: string
        fixed_interval?: string
        interval?: string
        min_doc_count: number
        extended_bounds: { min: number; max: number }
      }
    }
    [name: string]: unknown
  }
}

const movies: Doc[] = Array.from({ length: 25 }, (_, i) => ({
  _index: 'movies',
  _id: `m${i + 1}`,
  _source: {
    title: i === 0 ? 'Alien' : `Movie ${i + 1}`,
    year: 1970 + i,
    rating: (i % 10) + 1,
    director: { name: i === 0 ? 'Ridley Scott' : `Director ${i + 1}` },
    '@timestamp': `2024-01-${String(i + 1).padStart(2, '0')}T10:00:00Z`
  }
}))

const recipes: Doc[] = [
  { _index: 'recipes', _id: 'r1', _source: { name: 'Pancakes', rating: 'easy', time: { prep: 10 } } },
  { _index: 'recipes', _id: 'r2', _source: { name: 'Lasagna', rating: 'hard', time: { prep: 60 } } }
]

const logs: Doc[] = [{ _index: '.ds-logs-app-000001', _id: 'l1', _source: { message: 'started', level: 'info' } }]

export const weird: Doc[] = [
  {
    _index: 'weird',
    _id: 'w1',
    _source: {
      id: { a: 1, b: 'two' },
      'flat.key': 'dotted',
      'with space': 'spaced',
      ümlaut: 'grün',
      items: [{ k: 1 }, { k: 2 }],
      empty: {},
      nothing: null,
      flag: false,
      zero: 0,
      long: 'x'.repeat(500),
      tags: ['a, b', 'c'],
      ts: 1705312800000
    }
  },
  { _index: 'weird', _id: 'a/b', _routing: 'rk', _source: { 'with space': 'other', flag: true } },
  { _index: 'weird', _id: 'f1', fields: { 'with space': ['from fields'] } }
]

const odd: Doc[] = [{ _index: 'odd%index', _id: 'o1', _source: { name: 'percent' } }]

const MANY = Array.from({ length: 600 }, (_, i) => `many-${i}`)
const ALIASES: Record<string, string[]> = { food: ['recipes'] }
const DATA_STREAMS: Record<string, string[]> = { 'logs-app': ['.ds-logs-app-000001'] }
const EXPLICIT = ['weird', 'odd%index']
const INDICES = ['movies', 'recipes', '.hidden-index', '.ds-logs-app-000001', ...EXPLICIT, ...MANY]

const DOCS: Record<string, Doc[]> = { movies, recipes, weird, 'odd%index': odd, '.ds-logs-app-000001': logs }

const globToRegex = (glob: string) => new RegExp(`^${glob.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')}$`)

export const expandTargets = (path: string) => {
  const targets = decodeURIComponent(path)
    .split(',')
    .map((t) => t.trim())
  const result = new Set<string>()

  targets.forEach((target) => {
    if (target.startsWith('<')) result.add('weird')
    else if (ALIASES[target]) ALIASES[target].forEach((i) => result.add(i))
    else if (DATA_STREAMS[target]) DATA_STREAMS[target].forEach((i) => result.add(i))
    else {
      const regex = globToRegex(target)
      INDICES.filter(
        (index) =>
          regex.test(index) &&
          (target.startsWith('.') || !index.startsWith('.')) &&
          (target.startsWith('many') || !index.startsWith('many-')) &&
          (!target.startsWith('*') || !EXPLICIT.includes(index))
      ).forEach((i) => result.add(i))
    }
  })

  return [...result]
}

const fieldCaps = (indices: string[], includeUnmapped: boolean) => {
  const types: Record<string, Record<string, string[]>> = {
    title: { text: ['movies'] },
    'title.keyword': { keyword: ['movies'] },
    year: { long: ['movies'] },
    rating: { long: ['movies'], keyword: ['recipes'] },
    'director.name': { keyword: ['movies'] },
    director: { object: ['movies'] },
    '@timestamp': { date: ['movies'] },
    name: { text: ['recipes', 'odd%index'] },
    'time.prep': { long: ['recipes'] },
    _id: { _id: indices },
    id: { object: ['weird'] },
    'id.a': { long: ['weird'] },
    'id.b': { keyword: ['weird'] },
    'flat.key': { keyword: ['weird'] },
    'with space': { keyword: ['weird'] },
    ümlaut: { keyword: ['weird'] },
    items: { nested: ['weird'] },
    'items.k': { long: ['weird'] },
    flag: { boolean: ['weird'] },
    zero: { long: ['weird'] },
    long: { text: ['weird'] },
    tags: { keyword: ['weird'] },
    ts: { date: ['weird'] },
    nothing: { keyword: ['weird'] },
    'name.keyword': { keyword: ['recipes', 'odd%index'] }
  }

  const fields: Record<string, Record<string, object>> = {}
  Object.entries(types).forEach(([field, byType]) => {
    const entries = Object.entries(byType)
      .map(([type, inIndices]) => [type, inIndices.filter((i) => indices.includes(i))] as const)
      .filter(([, inIndices]) => inIndices.length > 0)
    if (entries.length === 0) return

    const mapped = entries.flatMap(([, inIndices]) => inIndices)
    const unmapped = indices.filter((i) => !mapped.includes(i))
    const all = entries.length === 1 && unmapped.length === 0

    fields[field] = Object.fromEntries(
      entries.map(([type, inIndices]) => [
        type,
        { type, searchable: true, aggregatable: type !== 'text', ...(all ? {} : { indices: inIndices }) }
      ])
    )
    if (includeUnmapped && unmapped.length > 0 && !all) {
      fields[field].unmapped = { type: 'unmapped', searchable: false, aggregatable: false, indices: unmapped }
    }
  })

  return { indices, fields }
}

const typedMappings = (indices: string[]) =>
  Object.fromEntries(
    indices.map((index) => [
      index,
      {
        mappings: {
          doc:
            index === 'movies'
              ? {
                  properties: {
                    title: { type: 'string', fields: { raw: { type: 'string', index: 'not_analyzed' } } },
                    year: { type: 'long' },
                    '@timestamp': { type: 'date' },
                    director: { properties: { name: { type: 'string', index: 'not_analyzed' } } }
                  }
                }
              : { properties: { name: { type: 'string' }, rating: { type: 'string', index: 'not_analyzed' } } }
        }
      }
    ])
  )

const valueAt = (source: unknown, path: string) =>
  path.split('.').reduce<unknown>((value, key) => (value as Record<string, unknown> | undefined)?.[key], source)

const UNIT_MS: Record<string, number> = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }

const esDouble = (value: number) => `__double:${value.toExponential(12).replace('e+', 'E')}`

const aggregations = (docs: Doc[], aggs: NonNullable<SearchBody['aggs']>) => {
  if (aggs.min) {
    const times = docs.map((doc) => Date.parse(String(doc._source?.['@timestamp']))).filter((time) => !Number.isNaN(time))
    return times.length
      ? { min: { value: esDouble(Math.min(...times)) }, max: { value: esDouble(Math.max(...times)) } }
      : { min: { value: null }, max: { value: null } }
  }
  if (aggs.histogram) {
    const { fixed_interval, interval, extended_bounds } = aggs.histogram.date_histogram
    const [, amount, unit] = (fixed_interval ?? interval)!.match(/^(\d+)(\w)$/)!
    const step = parseInt(amount) * UNIT_MS[unit]
    const start = Math.floor(extended_bounds.min / step) * step
    const count = Math.floor((extended_bounds.max - start) / step) + 1
    return {
      histogram: { buckets: Array.from({ length: count }, (_, i) => ({ key: start + i * step, doc_count: (i % 4) + 1 })) }
    }
  }
  if (aggs.values) {
    const field = aggs.values.terms.field.replace(/\.(keyword|raw)$/, '')
    const counts = new Map<string, number>()
    docs.forEach((doc) => {
      const value = valueAt(doc._source ?? doc.fields, field)
      if (value !== undefined && typeof value !== 'object') counts.set(String(value), (counts.get(String(value)) ?? 0) + 1)
    })
    const buckets = [...counts.entries()].map(([key, doc_count]) => ({ key, doc_count }))
    return { values: { buckets: buckets.slice(0, aggs.values.terms.size) } }
  }
  return { years: { buckets: [{ key: 1979, doc_count: 1 }] } }
}

const searchDocs = (indices: string[], body: SearchBody) => {
  let docs = indices.flatMap((index) => DOCS[index] || [])

  const queryString = body.query?.bool?.must?.[0]?.query_string?.query
  if (queryString?.includes(':')) {
    const [field, value] = queryString.split(':')
    docs = docs.filter((doc) => String(valueAt(doc._source ?? doc.fields, field) ?? '').toLowerCase() === value.toLowerCase())
  }

  const sort = body.sort?.[0]
  if (sort) {
    const [field, options] = Object.entries(sort)[0]
    const key = field.replace(/\.(keyword|raw)$/, '')
    const direction = options.order === 'desc' ? -1 : 1
    docs = [...docs].sort((a, b) => {
      const va = field === '_id' ? a._id : field === '_index' ? a._index : valueAt(a._source ?? a.fields, key)
      const vb = field === '_id' ? b._id : field === '_index' ? b._index : valueAt(b._source ?? b.fields, key)
      if (va === vb) return 0
      if (va === undefined) return 1
      if (vb === undefined) return -1
      return String(va) > String(vb) ? direction : -direction
    })
  }

  return docs
}

export type RecordedRequest = { method: string; path: string; rawPath: string; body: SearchBody; raw: string | null }

export const mockSearchCluster = async (page: Page, { version = 8 }: { version?: number } = {}) => {
  const requests: RecordedRequest[] = []
  const record = (route: Route) => {
    const url = new URL(route.request().url())
    const raw = route.request().postData()
    let body: SearchBody = {}
    try {
      body = raw ? JSON.parse(raw) : {}
    } catch {
      body = {}
    }
    requests.push({
      method: route.request().method(),
      path: decodeURIComponent(url.pathname + url.search),
      rawPath: url.pathname + url.search,
      body,
      raw
    })
    return url
  }

  await page.route(/localhost:9200\/_resolve\/index\//, (route) => {
    record(route)
    route.fulfill({
      json: {
        indices: INDICES.map((name) => ({
          name,
          attributes: name.startsWith('.') ? ['hidden', 'open'] : ['open'],
          ...(name === '.ds-logs-app-000001' && { data_stream: 'logs-app' })
        })),
        aliases: [{ name: 'food', indices: ['recipes'] }],
        data_streams: [{ name: 'logs-app', backing_indices: ['.ds-logs-app-000001'], timestamp_field: '@timestamp' }]
      }
    })
  })

  await page.route(/localhost:9200\/_cat\/indices\/[^?]*\?h=index(&|$)/, (route) => {
    const url = record(route)
    const target = url.pathname.replace('/_cat/indices/', '')
    const names = target ? expandTargets(target) : INDICES
    route.fulfill({ json: names.map((index) => ({ index })) })
  })

  await page.route(/localhost:9200\/_cat\/aliases\?h=alias/, (route) => {
    record(route)
    route.fulfill({ json: [{ alias: 'food' }] })
  })

  await page.route(/localhost:9200\/[^/]+\/_field_caps/, (route) => {
    const url = record(route)
    const indices = expandTargets(url.pathname.split('/')[1])
    route.fulfill({ json: fieldCaps(indices, url.searchParams.get('include_unmapped') === 'true') })
  })

  await page.route(/localhost:9200\/[^/]+\/_mapping$/, (route) => {
    const url = record(route)
    route.fulfill({ json: typedMappings(expandTargets(url.pathname.split('/')[1])) })
  })

  await page.route(/localhost:9200\/[^/]+\/_search/, async (route) => {
    const url = record(route)
    const body = route.request().postDataJSON() || {}
    const target = decodeURIComponent(url.pathname.split('/')[1])
    if (target === 'broken') {
      return route.fulfill({
        status: 400,
        json: { error: { type: 'search_phase_execution_exception', reason: 'Failed to parse query [title:(]' }, status: 400 }
      })
    }
    if (target === 'slow') await new Promise((resolve) => setTimeout(resolve, 1500))
    const indices = expandTargets(url.pathname.split('/')[1])
    const docs = searchDocs(indices, body)
    const from = body.from ?? 0
    const size = body.size ?? 10
    const isLogs = indices.includes('.ds-logs-app-000001')

    const total =
      version >= 7
        ? isLogs
          ? body.track_total_hits
            ? { value: 12345, relation: 'eq' }
            : { value: 10000, relation: 'gte' }
          : { value: docs.length, relation: 'eq' }
        : docs.length

    const json = {
      took: 3,
      hits: {
        total,
        hits: docs.slice(from, from + size).map((doc) => ({ ...doc, ...(version < 7 && { _type: 'doc' }), _score: 1 }))
      },
      ...(body.aggs && { aggregations: aggregations(docs, body.aggs) })
    }
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(json).replace(/"__double:([^"]+)"/g, '$1')
    })
  })

  await page.route(/localhost:9200\/[^/_][^/]*\/(_doc|doc)\/[^?]+/, (route) => {
    const url = record(route)
    if (route.request().method() === 'DELETE') return route.fulfill({ json: { result: 'deleted' } })
    if (route.request().method() === 'GET') {
      const [, index, , id] = url.pathname.split('/')
      const doc = (DOCS[decodeURIComponent(index)] || []).find((d) => d._id === decodeURIComponent(id)) || movies[0]
      return route.fulfill({ json: { ...doc, _version: 1, found: true, _source: doc._source ?? {} } })
    }
    route.fulfill({ json: { result: 'updated' } })
  })

  await page.route(/localhost:9200\/(_sql|_xpack\/sql|_plugins\/_sql|_query)(\?|$)/, (route) => {
    const url = record(route)
    const body = route.request().postDataJSON() || {}
    if (String(body.query ?? '').startsWith('BROKEN')) {
      return route.fulfill({
        status: 400,
        json: { error: { type: 'parsing_exception', reason: 'line 1:1: mismatched input BROKEN' }, status: 400 }
      })
    }

    const columns = [
      { name: 'title', type: 'text' },
      { name: 'year', type: 'long' }
    ]
    const firstPage = [
      ['Alien', 1970],
      ['Movie 2', 1971]
    ]
    if (url.pathname === '/_query') return route.fulfill({ json: { columns, values: firstPage } })
    if (url.pathname === '/_plugins/_sql') {
      return route.fulfill({ json: { schema: columns, datarows: firstPage, total: 2, size: 2, status: 200 } })
    }
    if (body.cursor === 'page2') return route.fulfill({ json: { rows: [['Movie 3', 1972]] } })
    route.fulfill({ json: { columns, rows: firstPage, cursor: 'page2' } })
  })

  await page.route(/localhost:9200\/_bulk/, (route) => {
    record(route)
    route.fulfill({ json: { errors: false, items: [] } })
  })

  return requests
}
