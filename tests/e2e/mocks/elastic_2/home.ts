import { Page } from '@playwright/test'

export const mockElasticHome = async (page: Page, { health }: { health?: string }) => {
  const status = health

  const mocks = {
    ping: {
      url: 'http://localhost:9200/',
      json: {
        'name': 'es-2-node-1',
        'cluster_name': 'es-2',
        'cluster_uuid': 'S2igbCvyRPOh5dy71tgDMw',
        'version': {
          'number': '2.4.6',
          'build_hash': '5376dca9f70f3abef96a77f4bb22720ace8240fd',
          'build_timestamp': '2017-07-18T12:17:44Z',
          'build_snapshot': false,
          'lucene_version': '5.5.4'
        },
        'tagline': 'You Know, for Search'
      },
    },
    clusterHealth: {
      url: 'http://localhost:9200/_cluster/health',
      json: {
        'cluster_name': 'es-2',
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
        'cluster_name': 'es-2',
        'status': status,
        'indices': {
          'count': 8,
          'shards': {
            'total': 16,
            'primaries': 8,
          },
          'docs': { 'count': 174, 'deleted': 42 },
          'store': { 'size_in_bytes': 86148700 },
        },
        'nodes': {
          'count': {
            'total': 2,
            'master_only': 0,
            'data_only': 0,
            'master_data': 2,
            'client': 0
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