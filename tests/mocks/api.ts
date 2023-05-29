export const mockElastic = async (page, status = 'green') => {
  await page.route('http://localhost:9200/_cluster/health', async route => {
    const json = {
      'cluster_name': 'es-7',
      'status': status,
      'timed_out': false,
      'number_of_nodes': 2,
      'number_of_data_nodes': 2,
      'active_primary_shards': 8,
      'active_shards': 16,
      'relocating_shards': 0,
      'initializing_shards': 0,
      'unassigned_shards': 9,
      'delayed_unassigned_shards': 0,
      'number_of_pending_tasks': 0,
      'number_of_in_flight_fetch': 0,
      'task_max_waiting_in_queue_millis': 0,
      'active_shards_percent_as_number': 64.0
    }
    await route.fulfill({ json })
  })

  await page.route('http://localhost:9200/_cat/indices/?h=index&health=yellow', async route => {
    const json = [{ 'index': 'manymany' }, { 'index': 'many4' }, { 'index': 'many3' }]
    await route.fulfill({ json })
  })

  await page.route('http://localhost:9200/', async route => {
    const json = {
      'name': 'es-7-node-1',
      'cluster_name': 'es-7',
      'cluster_uuid': 'FofbxqW5TL-NWyTYyUcUsw',
      'version': {
        'number': '7.17.10',
        'build_flavor': 'default',
        'build_type': 'docker',
        'build_hash': 'fecd68e3150eda0c307ab9a9d7557f5d5fd71349',
        'build_date': '2023-04-23T05:33:18.138275597Z',
        'build_snapshot': false,
        'lucene_version': '8.11.1',
        'minimum_wire_compatibility_version': '6.8.0',
        'minimum_index_compatibility_version': '6.0.0-beta1'
      },
      'tagline': 'You Know, for Search'
    }
    await route.fulfill({ json })
  })

  await page.route('http://localhost:9200/_cluster/stats', async route => {
    const json = {
      'cluster_name': 'es-7',
      'cluster_uuid': 'FofbxqW5TL-NWyTYyUcUsw',
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
          'data': 2,
          'master': 2
        }
      }
    }
    await route.fulfill({ json })
  })
}