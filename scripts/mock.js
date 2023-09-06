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
        url: 'http://localhost:9200/_search',
        json: {}
    },
    clusterHealth: {
        url: 'http://localhost:9200/_cluster/health',
        json: {
            'cluster_name': 'feeds-prod-1',
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
                'docs': {'count': 174182, 'deleted': 1337},
                'store': {'size_in_bytes': 13486148700}
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
    }
}

exports.mock = async page => {
    for (const method in mocks) {
        const url = mocks[method].url
        const json = mocks[method].json

        await page.route(url, async route => (await route.fulfill({json})))
    }
}