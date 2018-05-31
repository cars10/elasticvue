import { CONNECTION_STATES, DEFAULT_HOST, LOCALSTORAGE_KEY } from '../../consts'

export const connection = {
  state: {
    status: CONNECTION_STATES.UNKNOWN,
    wasConnected: false,
    elasticsearchClient: null,
    elasticsearchAdapter: null,
    elasticsearchHost: DEFAULT_HOST
  },
  mutations: {
    setElasticsearchAdapter (state, adapter) {
      state.wasConnected = true
      state.status = CONNECTION_STATES.SUCCESS
      state.elasticsearchAdapter = adapter
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
    resetConnection (state) {
      state.status = CONNECTION_STATES.UNKNOWN
      state.elasticsearchClient = null
      state.elasticsearchAdapter = null
    }
  }
}
