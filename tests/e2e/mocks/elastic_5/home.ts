import { Page } from '@playwright/test'

export const mockElasticHome = async (page: Page, { health }: { health?: string }) => {
  const status = health

  const mocks = {
    ping: {
      url: 'http://localhost:9200/',
      json: {
        'name': 'es-5-node-1',
        'cluster_name': 'es-5',
        'cluster_uuid': '9IP23Pq4QkOxajqjYiQR3A',
        'version': {
          'number': '5.6.16',
          'build_hash': '3a740d1',
          'build_date': '2019-03-13T15:33:36.565Z',
          'build_snapshot': false,
          'lucene_version': '6.6.1'
        },
        'tagline': 'You Know, for Search'
      },
    },
    clusterHealth: {
      url: 'http://localhost:9200/_cluster/health',
      json: {
        'cluster_name': 'es-5',
        'status': status,
        'timed_out': false,
        'number_of_nodes': 1,
        'number_of_data_nodes': 1,
        'active_primary_shards': 8,
        'active_shards': 16,
        'relocating_shards': 0,
        'initializing_shards': 0,
        'unassigned_shards': 0,
        'delayed_unassigned_shards': 0,
        'number_of_pending_tasks': 0,
        'number_of_in_flight_fetch': 0,
        'task_max_waiting_in_queue_millis': 0,
        'active_shards_percent_as_number': 100.0
      },
    },
    clusterStats: {
      url: 'http://localhost:9200/_cluster/stats',
      json: {
        'cluster_name': 'es-5',
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
            'ingest': 1
          }
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