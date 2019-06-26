import { CONNECTION_STATES, DEFAULT_HOST } from '../../consts'

export const connection = {
  namespaced: true,
  state: {
    status: CONNECTION_STATES.UNKNOWN,
    wasConnected: false,
    elasticsearchHost: DEFAULT_HOST,
    elasticsearchAdapter: null,
    apiVersion: ''
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
      state.wasConnected = false
      state.elasticsearchHost = host
    },
    setElasticsearchAdapter (state, adapter) {
      state.elasticsearchAdapter = adapter
    },
    setApiVersion (state, version) {
      state.apiVersion = version
    }
  }
}
