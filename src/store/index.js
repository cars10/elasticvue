import Vue from 'vue'
import Vuex from 'vuex'
import { CONNECTION_STATES, DEFAULT_VERSION } from '../consts'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    connection: CONNECTION_STATES.UNKNOWN,
    elasticsearchClient: null,
    elasticsearchVersion: DEFAULT_VERSION,
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
    setErrorState (state) {
      state.connection = CONNECTION_STATES.ERROR
    },
    setIndices (state, indices) {
      state.indices = indices
    }
  }
})
