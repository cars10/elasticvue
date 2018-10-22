import { CONNECTION_STATES, DEFAULT_HOST, LOCALSTORAGE_KEY } from '../../consts'

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
    setErrorState (state, error) {
      console.error('## ERROR', error)
      localStorage.removeItem(LOCALSTORAGE_KEY)
      state.wasConnected = false
      state.status = CONNECTION_STATES.ERROR
    },
    setElasticsearchAdapter (state, adapter) {
      state.elasticsearchAdapter = adapter
    }
  }
}
