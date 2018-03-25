import { CONNECTION_STATES, DEFAULT_HOST, LOCALSTORAGE_KEY } from '../../consts'

export const connection = {
  state: {
    status: CONNECTION_STATES.UNKNOWN,
    elasticsearchClient: null, // TODO remove
    elasticsearchHost: DEFAULT_HOST,
    indices: []
  },
  mutations: {
    setElasticsearchClient (state, client) {
      state.elasticsearchClient = client
      state.status = CONNECTION_STATES.SUCCESS
    },
    setElasticsearchHost (state, host) {
      state.elasticsearchHost = host
    },
    setErrorState (state, error) {
      console.error('## ERROR', error)
      localStorage.removeItem(LOCALSTORAGE_KEY)
      state.status = CONNECTION_STATES.ERROR
    },
    setIndices (state, indices) {
      state.indices = indices.sort((a, b) => {
        if (a.index > b.index) {
          return 1
        }
        if (a.index < b.index) {
          return -1
        }
        return 0
      })
    },
    sortIndices (state, sortObject) {
      state.indices = state.indices.sort((a, b) => {
        if (sortObject.order === 'asc') {
          return a[sortObject.prop].localeCompare(b[sortObject.prop])
        } else {
          return b[sortObject.prop].localeCompare(a[sortObject.prop])
        }
      })
    }
  }
}
