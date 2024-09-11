import { Page } from '@playwright/test'

export const mockElasticHome = async (page: Page, { health }: { health?: string }) => {
  const status = health

  const mocks = {
    ping: {
      url: 'http://localhost:9200/',
      json: {
        'name': 'os-2-node-1',
        'cluster_name': 'os-2',
        'cluster_uuid': 'UvzUYrtkR92Hy4N-eq_u-A',
        'version': {
          'distribution': 'opensearch',
          'number': '2.12.0',
          'build_type': 'tar',
          'build_hash': '2c355ce1a427e4a528778d4054436b5c4b756221',
          'build_date': '2024-02-20T02:18:49.874618333Z',
          'build_snapshot': false,
          'lucene_version': '9.9.2',
          'minimum_wire_compatibility_version': '7.10.0',
          'minimum_index_compatibility_version': '7.0.0'
        },
        'tagline': 'The OpenSearch Project: https://opensearch.org/'
      },
    },
    clusterHealth: {
      url: 'http://localhost:9200/_cluster/health',
      json: {
        'cluster_name': 'os-2',
        'status': status,
        'timed_out': false,
        'number_of_nodes': 2,
        'number_of_data_nodes': 2,
        'discovered_master': true,
        'discovered_cluster_manager': true,
        'active_primary_shards': 3,
        'active_shards': 6,
        'relocating_shards': 0,
        'initializing_shards': 0,
        'unassigned_shards': 0,
        'delayed_unassigned_shards': 0,
        'number_of_pending_tasks': 0,
        'number_of_in_flight_fetch': 0,
        'task_max_waiting_in_queue_millis': 0,
        'active_shards_percent_as_number': 100.0
      }
      ,
    },
    clusterStats: {
      url: 'http://localhost:9200/_cluster/stats',
      json: {
        'cluster_name': 'os-2',
        'cluster_uuid': 'UvzUYrtkR92Hy4N-eq_u-A',
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
            'cluster_manager': 2,
            'coordinating_only': 0,
            'data': 2,
            'ingest': 2,
            'master': 2,
            'remote_cluster_client': 2,
            'search': 0
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