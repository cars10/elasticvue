import { CONNECTION_STATES, DEFAULT_HOST } from '../../consts'

export const connection = {
  namespaced: true,
  state: {
    status: CONNECTION_STATES.UNKNOWN,
    wasConnected: false,
    elasticsearchHost: DEFAULT_HOST,
    elasticsearchAdapter: null
  },
  mutations: {
    setConnected (state) {
      state.wasConnected = true
      state.status = CONNECTION_STATES.SUCCESS
    },
    setElasticsearchHost (state, host) {
      state.wasConnected = false
      state.elasticsearchHost = host
    },
    setElasticsearchAdapter (state, adapter) {
      state.elasticsearchAdapter = adapter
    }
  }
}
