jest.mock('@/services/ElasticsearchAdapter', () => {
  return jest.fn().mockImplementation(() => {
    return {
      ping: () => {
      },
      clientInfo: function () {
        console.log('SAMPLE')
        const sample = {
          'name': 'testname',
          'cluster_name': 'testcluster',
          'cluster_uuid': '-GXVapr-QwSfUXDi_ji0Bg',
          'version': {
            'number': '7.7.0',
            'build_flavor': 'default',
            'build_type': 'rpm',
            'build_hash': '81a1e9eda8e6183f5237786246f6dced26a10eaf',
            'build_date': '2020-05-12T02:01:37.602180Z',
            'build_snapshot': false,
            'lucene_version': '8.5.1',
            'minimum_wire_compatibility_version': '6.8.0',
            'minimum_index_compatibility_version': '6.0.0-beta1'
          },
          'tagline': 'You Know, for Search'
        }
        return Promise.resolve(sample)
      },
      clusterHealth: function () {
        const sample = {
          'cluster_name': 'elasticsearch',
          'status': 'yellow',
          'timed_out': false,
          'number_of_nodes': 1,
          'number_of_data_nodes': 1,
          'active_primary_shards': 8,
          'active_shards': 8,
          'relocating_shards': 0,
          'initializing_shards': 0,
          'unassigned_shards': 8,
          'delayed_unassigned_shards': 0,
          'number_of_pending_tasks': 0,
          'number_of_in_flight_fetch': 0,
          'task_max_waiting_in_queue_millis': 0,
          'active_shards_percent_as_number': 50.0
        }
        return Promise.resolve(sample)
      }
    }
  })
})
