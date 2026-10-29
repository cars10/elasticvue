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
  authenticate: {
    url: /localhost:9200\/(_security|_xpack\/security)\/_authenticate$/,
    json: { username: 'elastic', roles: ['superuser'] }
  }
}
