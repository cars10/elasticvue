import Vue from 'vue'
import Vuex from 'vuex'
import { plugins } from './plugins'
import { connection } from './modules/connection'
import { indices } from './modules/indices'
import { nodes } from './modules/nodes'
import { query } from './modules/query'
import { search } from './modules/search'
import { snackbar } from './modules/snackbar'
import { theme } from './modules/theme'

Vue.use(Vuex)

export default new Vuex.Store({
  plugins: plugins,
  modules: {
    connection,
    indices,
    nodes,
    query,
    search,
    snackbar,
    theme
  }
})
