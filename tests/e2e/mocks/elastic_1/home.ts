import { Page } from '@playwright/test'

export const mockElasticHome = async (page: Page, { health }: { health?: string }) => {
  const status = health

  const mocks = {
    ping: {
      url: 'http://localhost:9200/',
      json: {
        'status': 200,
        'name': 'es-1-node-1',
        'cluster_name': 'es-1',
        'version': {
          'number': '1.7.6',
          'build_hash': 'c730b59357f8ebc555286794dcd90b3411f517c9',
          'build_timestamp': '2016-11-18T15:21:16Z',
          'build_snapshot': false,
          'lucene_version': '4.10.4'
        },
        'tagline': 'You Know, for Search'
      },
    },
    clusterHealth: {
      url: 'http://localhost:9200/_cluster/health',
      json: {
        'cluster_name': 'es-1',
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
        'number_of_in_flight_fetch': 0
      },
    },
    clusterStats: {
      url: 'http://localhost:9200/_cluster/stats',
      json: {
        'cluster_name': 'es-1',
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