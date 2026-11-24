import { bulk, CLUSTERS, es, waitForGreen } from './elasticsearch.mjs'
import { incidentDocs, logDocs, logIndex, movieDocs, orderDocs, productDocs, random } from './data.mjs'

const MAPPINGS = {
  logs: {
    properties: {
      '@timestamp': { type: 'date' },
      level: { type: 'keyword' },
      service: { type: 'keyword' },
      host: { type: 'keyword' },
      region: { type: 'keyword' },
      message: { type: 'text', fields: { keyword: { type: 'keyword' } } },
      http: { properties: { method: { type: 'keyword' }, path: { type: 'keyword' }, status: { type: 'short' } } },
      duration_ms: { type: 'integer' },
      user: { properties: { id: { type: 'keyword' } } },
      trace_id: { type: 'keyword' }
    }
  },
  movies: {
    properties: {
      title: { type: 'text', fields: { keyword: { type: 'keyword' } } },
      year: { type: 'integer' },
      genre: { type: 'keyword' },
      director: { properties: { name: { type: 'keyword' } } },
      rating: { type: 'float' },
      votes: { type: 'integer' },
      runtime: { type: 'integer' },
      released: { type: 'date' },
      description: { type: 'text' }
    }
  },
  orders: {
    properties: {
      order_id: { type: 'keyword' },
      customer: { properties: { name: { type: 'keyword' }, country: { type: 'keyword' } } },
      status: { type: 'keyword' },
      items: { type: 'integer' },
      total: { type: 'double' },
      currency: { type: 'keyword' },
      payment_method: { type: 'keyword' },
      created_at: { type: 'date' }
    }
  },
  products: {
    properties: {
      sku: { type: 'keyword' },
      name: { type: 'text', fields: { keyword: { type: 'keyword' } } },
      category: { type: 'keyword' },
      price: { type: 'double' },
      stock: { type: 'integer' }
    }
  }
}

const createIndex = (uri, name, mappings, shards, replicas) =>
  es(uri, name, { method: 'PUT', body: { settings: { number_of_shards: shards, number_of_replicas: replicas }, mappings } })

const logsTemplate = (uri, shards, replicas) =>
  es(uri, '_index_template/application-logs', {
    method: 'PUT',
    body: {
      index_patterns: ['logs-*'],
      priority: 200,
      template: {
        settings: { number_of_shards: shards, number_of_replicas: replicas },
        mappings: MAPPINGS.logs,
        aliases: { logs: {} }
      }
    }
  })

const seedCluster = async (cluster, { shards, replicas, movies, orders, products, logsPerDay, incident }) => {
  const uri = CLUSTERS[cluster].nodes[0]
  const rand = random(cluster.length)
  console.log(`  seeding ${cluster}`)
  await logsTemplate(uri, shards, replicas)
  await bulk(uri, (doc) => logIndex(new Date(doc['@timestamp'])), [
    ...logDocs(rand, { days: 3, perDay: logsPerDay }),
    ...incidentDocs(rand, { count: incident })
  ])

  if (movies) {
    await createIndex(uri, 'movies', MAPPINGS.movies, 1, replicas)
    await bulk(uri, () => 'movies', movieDocs(rand, movies))
  }
  if (orders) {
    await createIndex(uri, 'orders', MAPPINGS.orders, shards, replicas)
    await bulk(uri, () => 'orders', orderDocs(rand, orders))
  }
  if (products) {
    await createIndex(uri, 'products', MAPPINGS.products, 1, replicas)
    await bulk(uri, () => 'products', productDocs(rand, products))
  }
  await es(uri, '_refresh', { method: 'POST' })
  const { count } = await es(uri, '_count')
  console.log(`  seeded ${cluster} with ${count} documents`)
}

const YEAR = 365 * 24 * 60 * 60 * 1000

const seedProblems = async () => {
  const uri = CLUSTERS.production.nodes[0]
  const rand = random(2024)
  console.log('  adding over-replicated and write-blocked indices to production')
  await createIndex(uri, 'archive-2024', MAPPINGS.orders, 2, 3)
  await bulk(uri, () => 'archive-2024', orderDocs(rand, 2500, Date.now() - YEAR))
  await createIndex(uri, 'orders-2025', MAPPINGS.orders, 1, 1)
  await bulk(uri, () => 'orders-2025', orderDocs(rand, 3500, Date.now() - YEAR / 2))
  await es(uri, 'archive-2024,orders-2025/_refresh', { method: 'POST' })
  await es(uri, 'orders-2025/_settings', { method: 'PUT', body: { 'index.blocks.write': true } })
}

const seedSnapshots = async () => {
  const uri = CLUSTERS.staging.nodes[0]
  console.log('  adding snapshots and a snapshot policy to staging')
  await es(uri, '_snapshot/backups', { method: 'PUT', body: { type: 'fs', settings: { location: '/tmp/snapshots' } } })
  for (const [name, indices] of [
    ['nightly-1', 'movies,orders'],
    ['nightly-2', 'logs-*'],
    ['nightly-3', '*']
  ]) {
    await es(uri, `_snapshot/backups/${name}?wait_for_completion=true`, { method: 'PUT', body: { indices } })
  }
  await es(uri, '_slm/policy/nightly', {
    method: 'PUT',
    body: {
      schedule: '0 30 1 * * ?',
      name: '<nightly-{now/d}>',
      repository: 'backups',
      config: { indices: ['*'] },
      retention: { expire_after: '30d', min_count: 5, max_count: 50 }
    }
  })
}

const ROLES = {
  logs_reader: { indices: [{ names: ['logs-*'], privileges: ['read', 'view_index_metadata'] }] },
  logs_writer: { cluster: ['monitor'], indices: [{ names: ['logs-*'], privileges: ['create_doc', 'auto_configure'] }] },
  ops_admin: { cluster: ['monitor', 'manage'], indices: [{ names: ['*'], privileges: ['monitor', 'manage'] }] }
}

const USERS = {
  'ava.berg': { full_name: 'Ava Berg', roles: ['ops_admin'] },
  'noah.sato': { full_name: 'Noah Sato', roles: ['logs_reader', 'kibana_admin'] },
  'mia.costa': { full_name: 'Mia Costa', roles: ['logs_reader'] },
  'log-shipper': { roles: ['logs_writer'] },
  grafana: { roles: ['logs_reader', 'monitoring_user'] }
}

const seedSecurity = async () => {
  const uri = CLUSTERS.logging.nodes[0]
  console.log('  adding users and roles to logging')
  for (const [name, body] of Object.entries(ROLES)) await es(uri, `_security/role/${name}`, { method: 'PUT', body })
  for (const [name, body] of Object.entries(USERS)) {
    await es(uri, `_security/user/${name}`, { method: 'PUT', body: { password: 'showcase-password', ...body } })
  }
}

export const seed = async () => {
  console.log('> seeding data')
  await Promise.all([
    seedCluster('production', { shards: 3, replicas: 1, movies: 1500, orders: 6000, products: 400, logsPerDay: 15000, incident: 1500 }),
    seedCluster('staging', { shards: 1, replicas: 1, movies: 300, orders: 800, products: 0, logsPerDay: 1500, incident: 0 }),
    seedCluster('logging', { shards: 1, replicas: 0, movies: 0, orders: 0, products: 0, logsPerDay: 6000, incident: 300 })
  ])
  console.log('> waiting for production shards to be assigned')
  await waitForGreen('production')

  await seedProblems()
  await seedSnapshots()
  await seedSecurity()
}
