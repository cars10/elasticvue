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

export const seed = async () => {
  console.log('> seeding data')
  await Promise.all([
    seedCluster('production', { shards: 3, replicas: 1, movies: 1500, orders: 6000, products: 400, logsPerDay: 15000, incident: 1500 }),
    seedCluster('staging', { shards: 1, replicas: 1, movies: 300, orders: 800, products: 0, logsPerDay: 1500, incident: 0 }),
    seedCluster('logging', { shards: 1, replicas: 0, movies: 0, orders: 0, products: 0, logsPerDay: 6000, incident: 300 })
  ])
  console.log('> waiting for production shards to be assigned')
  await waitForGreen('production')

  const { cluster_uuid } = await es(CLUSTERS.production.nodes[0], '')
  return { productionUuid: cluster_uuid }
}
