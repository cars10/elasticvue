import { bulk, CLUSTERS, es } from './elasticsearch.mjs'
import { random, sessionDocs } from './data.mjs'

const uri = CLUSTERS.production.nodes[0]

const SESSIONS_MAPPING = {
  properties: {
    user_id: { type: 'keyword' },
    device: { type: 'keyword' },
    country: { type: 'keyword' },
    created_at: { type: 'date' },
    expires_at: { type: 'date' }
  }
}

const seedSessions = async () => {
  const exists = await es(uri, 'sessions').then(
    () => true,
    () => false
  )
  if (!exists) {
    await es(uri, 'sessions', {
      method: 'PUT',
      body: { settings: { number_of_shards: 3, number_of_replicas: 1 }, mappings: SESSIONS_MAPPING }
    })
  }
  await bulk(uri, () => 'sessions', sessionDocs(random(Date.now() % 1000), 3000))
  await es(uri, 'sessions/_refresh', { method: 'POST' })
}

const TASKS = [
  {
    action: 'indices:data/write/reindex',
    start: () =>
      es(uri, '_reindex?wait_for_completion=false&requests_per_second=8&slices=3', {
        method: 'POST',
        body: { source: { index: 'orders', size: 40 }, dest: { index: 'orders-2026' } }
      })
  },
  {
    action: 'indices:data/write/update/byquery',
    start: () =>
      es(uri, 'movies/_update_by_query?wait_for_completion=false&requests_per_second=2&scroll_size=10&conflicts=proceed', {
        method: 'POST',
        body: { script: { lang: 'painless', source: 'ctx._source.votes += 1' } }
      })
  },
  {
    action: 'indices:data/write/delete/byquery',
    start: async () => {
      await seedSessions()
      return es(uri, 'sessions/_delete_by_query?wait_for_completion=false&requests_per_second=4&scroll_size=20', {
        method: 'POST',
        body: { query: { range: { expires_at: { lt: 'now' } } } }
      })
    }
  }
]

const runningActions = async () => {
  const actions = TASKS.map(({ action }) => action).join(',')
  const { nodes = {} } = await es(uri, `_tasks?actions=${actions}`)
  return new Set(
    Object.values(nodes)
      .flatMap((node) => Object.values(node.tasks || {}))
      .map((task) => task.action)
  )
}

export const ensureTasks = async () => {
  const running = await runningActions()
  for (const task of TASKS) {
    if (running.has(task.action)) continue
    const { task: id } = await task.start()
    console.log(`  started ${task.action} (${id})`)
  }
}
