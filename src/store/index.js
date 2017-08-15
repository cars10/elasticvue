import Vue from 'vue'
import Vuex from 'vuex'
import { CONNECTION_STATES, DEFAULT_VERSION, DEFAULT_HOST } from '../consts'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    connection: CONNECTION_STATES.UNKNOWN,
    elasticsearchClient: null,
    elasticsearchVersion: DEFAULT_VERSION,
    elasticsearchHost: DEFAULT_HOST,
    indices: []
  },
  mutations: {
    setElasticsearchClient (state, client) {
      state.elasticsearchClient = client
      state.connection = CONNECTION_STATES.SUCCESS
    },
    setElasticsearchVersion (state, version) {
      state.elasticsearchVersion = version
    },
    setElasticsearchHost (state, host) {
      state.elasticsearchHost = host
    },
    setErrorState (state) {
      state.connection = CONNECTION_STATES.ERROR
    },
    setIndices (state, indices) {
      state.indices = indices
    },
    sortIndices (state, sortObject) {
      state.indices = state.indices.sort((a, b) => {
        if (sortObject.order === 'asc') {
          return (a[sortObject.prop] > b[sortObject.prop]) ? 1 : ((b[sortObject.prop] > a[sortObject.prop]) ? -1 : 0)
        } else {
          return (a[sortObject.prop] > b[sortObject.prop]) ? -1 : ((b[sortObject.prop] > a[sortObject.prop]) ? 1 : 0)
        }
      })
    }
  }
})
