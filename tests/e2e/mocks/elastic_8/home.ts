import { Page } from '@playwright/test'

export const mockElasticHome = async (page: Page, { health }: { health?: string }) => {
  const status = health

  const mocks = {
    ping: {
      url: 'http://localhost:9200/',
      json: {
        'name' : 'es-8-node-1',
        'cluster_name' : 'es-8',
        'cluster_uuid' : 'ecdKaffmR9WkFbKDW4PUWw',
        'version' : {
          'number' : '8.7.1',
          'build_flavor' : 'default',
          'build_type' : 'docker',
          'build_hash' : 'f229ed3f893a515d590d0f39b05f68913e2d9b53',
          'build_date' : '2023-04-27T04:33:42.127815583Z',
          'build_snapshot' : false,
          'lucene_version' : '9.5.0',
          'minimum_wire_compatibility_version' : '7.17.0',
          'minimum_index_compatibility_version' : '7.0.0'
        },
        'tagline' : 'You Know, for Search'
      },
    },
    clusterHealth: {
      url: 'http://localhost:9200/_cluster/health',
      json: {
        'cluster_name': 'es-8',
        'status': status,
        'timed_out': false,
        'number_of_nodes': 2,
        'number_of_data_nodes': 2,
        'active_primary_shards': 5,
        'active_shards': 10,
        'relocating_shards': 0,
        'initializing_shards': 0,
        'unassigned_shards': 2,
        'delayed_unassigned_shards': 0,
        'number_of_pending_tasks': 0,
        'number_of_in_flight_fetch': 0,
        'task_max_waiting_in_queue_millis': 0,
        'active_shards_percent_as_number': 83.33333333333334
      },
    },
    clusterStats: {
      url: 'http://localhost:9200/_cluster/stats',
      json: {
        'cluster_name': 'es-8',
        'cluster_uuid': 'ecdKaffmR9WkFbKDW4PUWw',
        'status': status,
        'indices': {
          'count': 8,
          'shards': {
            'total': 16,
            'primaries': 8,
          },
          'docs': { 'count': 174, 'deleted': 42 },
          'store': { 'size_in_bytes': 86148700 }
        },
        'nodes': {
          'count': {
            'total': 2,
            'data': 2,
            'coordinating_only': 0,
            'master': 2,
            'ingest': 2
          },
        }
      }
    },
    catIndicesYellow: {
      url: 'http://localhost:9200/_cat/indices/?h=index&health=yellow',
      json: [{ 'index': 'unhealthy-index' }]
    }
  }

  for (const method in mocks) {
    const url = mocks[method as keyof typeof mocks].url
    const json = mocks[method as keyof typeof mocks].json

    await page.route(url, async route => (await route.fulfill({ json })))
  }
}