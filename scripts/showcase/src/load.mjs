import { bulk, CLUSTERS, es, sleep } from './elasticsearch.mjs'
import { logDoc, logIndex, random } from './data.mjs'

const WORDS = ['timeout', 'payment', 'cache', 'order', 'stock', 'signed', 'slow', 'retrying']
const GENRES = ['Drama', 'Comedy', 'Thriller', 'Sci-Fi', 'Action']

const SEARCHES = [
  (pick) => ['logs', { query: { bool: { must: { match: { message: pick(WORDS) } }, filter: { range: { '@timestamp': { gte: 'now-1h' } } } } } }],
  () => ['logs', { size: 0, aggs: { services: { terms: { field: 'service' }, aggs: { latency: { avg: { field: 'duration_ms' } } } } } }],
  () => ['logs', { size: 0, query: { range: { '@timestamp': { gte: 'now-24h' } } }, aggs: { timeline: { date_histogram: { field: '@timestamp', fixed_interval: '30m' } } } }],
  (pick) => ['movies', { query: { term: { genre: pick(GENRES) } }, sort: [{ rating: 'desc' }] }],
  (pick) => ['movies', { query: { match: { title: pick(['silent', 'harbor', 'kingdom', 'echo', 'river']) } } }],
  () => ['orders', { query: { range: { total: { gte: 250 } } }, sort: [{ created_at: 'desc' }] }],
  () => ['orders', { size: 0, aggs: { countries: { terms: { field: 'customer.country' }, aggs: { revenue: { sum: { field: 'total' } } } } } }],
  (pick) => ['products', { query: { term: { category: pick(['Books', 'Garden', 'Kitchen', 'Toys']) } } }]
]

export const startLoad = () => {
  const { nodes } = CLUSTERS.production
  const rand = random(42)
  const pick = (list) => list[Math.floor(rand() * list.length)]
  const started = Date.now()
  let running = true

  const intensity = () => 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(((Date.now() - started) / 60000) * 2 * Math.PI))

  const searcher = async (worker) => {
    while (running) {
      const [index, body] = pick(SEARCHES)(pick)
      await es(nodes[worker % nodes.length], `${index}/_search`, { method: 'POST', body }).catch(() => {})
      await sleep(15 + 150 * (1 - intensity()) + rand() * 40)
    }
  }

  const indexer = async () => {
    while (running) {
      const docs = Array.from({ length: Math.round(10 + 90 * intensity()) }, () => logDoc(rand, Date.now()))
      await bulk(pick(nodes), (doc) => logIndex(new Date(doc['@timestamp'])), docs).catch(() => {})
      await sleep(400)
    }
  }

  const workers = [...Array.from({ length: 6 }, (_, worker) => searcher(worker)), indexer()]
  return async () => {
    running = false
    await Promise.all(workers)
  }
}
