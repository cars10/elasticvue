import Vue from 'vue'
import Vuex from 'vuex'
import { ELASTICSEARCH_API_VERSIONS } from '../consts'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    elasticsearchClient: null,
    elasticsearchVersion: ELASTICSEARCH_API_VERSIONS[0]
  },
  mutations: {
    setElasticsearchClient (state, client) {
      state.elasticsearchClient = client
    },
    setElasticsearchVersion (state, version) {
      state.elasticsearchVersion = version
    }
  }
})
