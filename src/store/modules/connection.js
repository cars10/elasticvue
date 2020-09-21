import { CONNECTION_STATES, DEFAULT_HOST } from '@/consts'

export const connection = {
  namespaced: true,
  state: {
    status: CONNECTION_STATES.UNKNOWN,
    wasConnected: false,
    elasticsearchHost: { name: 'local', uri: DEFAULT_HOST },
    elasticsearchInstances: [],
    elasticsearchAdapter: null
  },
  mutations: {
    setConnected (state) {
      state.wasConnected = true
      state.status = CONNECTION_STATES.SUCCESS
    },
    setDisconnected (state) {
      state.status = CONNECTION_STATES.UNKNOWN
    },
    setElasticsearchHost (state, host) {
      state.elasticsearchHost = host
    },
    setElasticsearchAdapter (state, adapter) {
      state.elasticsearchAdapter = adapter
    },
    addElasticsearchInstance (state, instance) {
      state.elasticsearchInstances.push(instance)
    },
    removeElasticsearchInstance (state, index) {
      state.elasticsearchInstances.splice(index, 1)
    }
  }
}
