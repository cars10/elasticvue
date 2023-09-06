exports.mock = async page => {
  const mocks = {
    ping: {
      url: 'http://localhost:9200/',
      json: {
        'name': 'feeds-prod-1',
        'cluster_name': 'feeds-production',
        'cluster_uuid': 'ecdKaffmR9WkFbKDW4PUWw',
        'version': {
          'number': '8.7.1',
          'build_flavor': 'default',
          'build_type': 'docker',
          'build_hash': 'f229ed3f893a515d590d0f39b05f68913e2d9b53',
          'build_date': '2023-04-27T04:33:42.127815583Z',
          'build_snapshot': false,
          'lucene_version': '9.5.0',
          'minimum_wire_compatibility_version': '7.17.0',
          'minimum_index_compatibility_version': '7.0.0'
        },
        'tagline': 'You Know, for Search'
      },
    },
    search: {
      url: 'http://localhost:9200/_search', json: {}
    },
    searchSearch: {
      url: 'http://localhost:9200/*/_search',
      json: {
        'took': 2, 'timed_out': false, '_shards': { 'total': 2, 'successful': 1, 'skipped': 0, 'failed': 0 },
        'hits': {
          'total': { 'value': 25, 'relation': 'eq' }, 'max_score': 1.0,
          'hits': []
        }
      }
    },
    searchIndices: {
      url: 'http://localhost:9200/movies',
      json: {
        'movies': {
          'mappings': {
            'properties': {
              'name': {
                'type': 'text'
              }
            }
          }
        }
      }
    },
    clusterHealth: {
      url: 'http://localhost:9200/_cluster/health',
      json: {
        'cluster_name': 'feeds-production',
        'status': 'green',
        'timed_out': false,
        'number_of_nodes': 4,
        'number_of_data_nodes': 4,
        'active_primary_shards': 25,
        'active_shards': 50,
        'relocating_shards': 0,
        'initializing_shards': 0,
        'unassigned_shards': 0,
        'delayed_unassigned_shards': 0,
        'number_of_pending_tasks': 0,
        'number_of_in_flight_fetch': 0,
        'task_max_waiting_in_queue_millis': 0,
        'active_shards_percent_as_number': 100
      },
    },
    clusterStats: {
      url: 'http://localhost:9200/_cluster/stats',
      json: {
        'cluster_name': 'feeds-production',
        'cluster_uuid': 'ecdKaffmR9WkFbKDW4PUWw',
        'status': 'green',
        'indices': {
          'count': 25,
          'shards': {
            'total': 50,
            'primaries': 25,
          },
          'docs': { 'count': 174182, 'deleted': 1337 },
          'store': { 'size_in_bytes': 13486148700 }
        },
        'nodes': {
          'count': {
            'total': 4,
            'data': 4,
            'coordinating_only': 0,
            'master': 4,
            'ingest': 4
          },
        }
      }
    },
    shardIndices: {
      url: 'http://localhost:9200/_cat/indices/?h=index%2Chealth%2Cpri%2Crep%2Cstatus&s=index',
      json: []
    },
    shardShards: {
      url: 'http://localhost:9200/_cat/shards/?h=index%2Cshard%2Cprirep%2Cstate%2Cnode',
      json: []
    },
    indexIndices: {
      url: 'http://localhost:9200/_cat/indices/?h=index%2Chealth%2Cstatus%2Cuuid%2Cpri%2Crep%2Cdocs.count%2Cstore.size&bytes=b',
      json: []
    },
    flush: {
      url: 'http://localhost:9200/_flush',
      json: { '_shards': { 'total': 50, 'successful': 50, 'failed': 0 } }
    }
  }

  const indices = ['movies', 'omdb', 'imdb', 'actors', 'genres', 'scenes', 'sales', 'products', 'categories', 'tweets']

  for (const idx of indices) {
    // shards
    const nodes = ['feeds-prod-1', 'feeds-prod-2', 'feeds-prod-3', 'feeds-prod-4']
    mocks.shardIndices.json.push({ 'index': idx, 'health': 'green', 'pri': '1', 'rep': '1', 'status': 'open' })

    const node1 = nodes.splice(Math.floor(Math.random() * nodes.length), 1)[0]
    mocks.shardShards.json.push({ 'index': idx, 'shard': '0', 'prirep': 'p', 'state': 'STARTED', 'node': node1 })
    const node2 = nodes.splice(Math.floor(Math.random() * nodes.length), 1)[0]
    mocks.shardShards.json.push({ 'index': idx, 'shard': '0', 'prirep': 'r', 'state': 'STARTED', 'node': node2 })

    // indices
    const docs = Math.random() * 50000
    mocks.indexIndices.json.push({
      'index': idx,
      'health': 'green',
      'status': 'open',
      'uuid': (Math.random() + 1).toString(36).substring(2) + (Math.random() + 1).toString(36).substring(2),
      'pri': '1',
      'rep': '1',
      'docs.count': docs.toString(),
      'store.size': (docs * 1024 * 10).toString()
    })
  }

  for (let i = 0; i < 15; i++) {
    // shards
    mocks.shardIndices.json.push({ 'index': `tweets${i}`, 'health': 'green', 'pri': '1', 'rep': '1', 'status': 'open' })
    // indices
    mocks.indexIndices.json.push({
      'index': `tweets${i}`,
      'health': 'green',
      'status': 'open',
      'uuid': (Math.random() + 1).toString(36).substring(2) + (Math.random() + 1).toString(36).substring(2),
      'pri': '1',
      'rep': '1',
      'docs.count': (Math.random() * 10000).toString(),
      'store.size': (Math.random() * 1000000).toString()
    })
  }

  const movies = ['Iron Man', 'Iron Man 2', 'Star Wars: Revenge of the Sith', '96 Hours', 'The Lord of the Rings', '300', 'Fight Club', 'Europa Report', 'Avengers: Age of Ultron', 'Lost in Translation']
  for (let i = 0; i < 25; i++) {
    mocks.searchSearch.json.hits.hits.push({
      '_index': 'movies', '_type': '_doc', '_id': 'cS9nZooBXKihOZ47aiTk', '_score': 1.0,
      '_source': {
        'name': movies[i]
      }
    })
  }

  for (const method in mocks) {
    const url = mocks[method].url
    const json = mocks[method].json

    await page.route(url, async route => (await route.fulfill({ json })))
  }
}