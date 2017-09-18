import { CONNECTION_STATES, DEFAULT_VERSION, DEFAULT_HOST } from '../../consts'

export const connection = {
  state: {
    status: CONNECTION_STATES.UNKNOWN,
    elasticsearchClient: null,
    elasticsearchVersion: DEFAULT_VERSION,
    elasticsearchHost: DEFAULT_HOST,
    indices: []
  },
  mutations: {
    setElasticsearchClient (state, client) {
      state.elasticsearchClient = client
      state.status = CONNECTION_STATES.SUCCESS
    },
    setElasticsearchVersion (state, version) {
      state.elasticsearchVersion = version
    },
    setElasticsearchHost (state, host) {
      state.elasticsearchHost = host
    },
    setErrorState (state, error) {
      console.error('## ERROR', error)
      state.status = CONNECTION_STATES.ERROR
    },
    setIndices (state, indices) {
      state.indices = indices
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
