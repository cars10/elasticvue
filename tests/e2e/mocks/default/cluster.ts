export const clusterDefaults = {
  clusterSettings: {
    url: /localhost:9200\/_cluster\/settings\?/,
    json: { persistent: {}, transient: {}, defaults: {} }
  },
  nodesStats: {
    url: /localhost:9200\/_nodes\/stats\//,
    json: { nodes: {} }
  },
  masterNode: {
    url: /localhost:9200\/_cluster\/state\/master_node$/,
    json: { master_node: 'node-1' }
  },
  indexBlocks: {
    url: /localhost:9200\/_cluster\/state\/blocks$/,
    json: { blocks: {} }
  },
  indexSettings: {
    url: /localhost:9200\/_all\/_settings\?/,
    json: {}
  },
  catAliasNames: {
    url: /localhost:9200\/_cat\/aliases\?/,
    json: []
  },
  roleMappings: {
    url: /localhost:9200\/(_security|_xpack\/security)\/role_mapping/,
    json: {}
  },
  tasks: {
    url: /localhost:9200\/_tasks\?/,
    json: {
      nodes: {
        node1: {
          name: 'node-1',
          tasks: {
            'node1:1': {
              action: 'indices:data/write/reindex',
              type: 'transport',
              description: 'reindex from [logs] to [logs-new]',
              start_time_in_millis: 1700000000000,
              running_time_in_nanos: 125000000000,
              cancellable: true,
              status: { total: 1000, created: 400, updated: 100, deleted: 0, noops: 0, version_conflicts: 0 }
            },
            'node1:2': {
              action: 'indices:data/write/bulk',
              running_time_in_nanos: 2000000000,
              cancellable: false,
              parent_task_id: 'node1:1'
            },
            'node1:3': {
              action: 'cluster:monitor/nodes/stats',
              running_time_in_nanos: 3000000,
              cancellable: false
            },
            'node1:5': {
              action: 'xpack/ml/job[c]',
              type: 'persistent',
              running_time_in_nanos: 86400000000000,
              cancellable: true
            },
            'node1:4': {
              action: 'cluster:monitor/tasks/lists',
              running_time_in_nanos: 1000000,
              cancellable: false
            }
          }
        }
      }
    }
  },
  authenticate: {
    url: /localhost:9200\/(_security|_xpack\/security)\/_authenticate$/,
    json: { username: 'elastic', roles: ['superuser'] }
  }
}
