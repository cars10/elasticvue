import Vue from 'vue'
import Vuex from 'vuex'
import { plugins } from './plugins'
import { connection } from './modules/connection'
import { indices } from './modules/indices'
import { nodes } from './modules/nodes'
import { queryRest } from './modules/queryRest'
import { queryApiBrowser } from './modules/queryApiBrowser'
import { search } from './modules/search'
import { snackbar } from './modules/snackbar'
import { theme } from './modules/theme'
import { modal } from './modules/modal'

Vue.use(Vuex)

export default new Vuex.Store({
  plugins: plugins,
  modules: {
    connection,
    indices,
    nodes,
    modal,
    queryRest,
    queryApiBrowser,
    search,
    snackbar,
    theme
  }
})
