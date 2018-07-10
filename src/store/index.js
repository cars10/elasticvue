import Vue from 'vue'
import Vuex from 'vuex'
import { plugins } from './plugins'
import { search } from './modules/search'
import { connection } from './modules/connection'
import { theme } from './modules/theme'
import { snackbar } from './modules/snackbar'
import { indices } from './modules/indices'
import { query } from './modules/query'

Vue.use(Vuex)

export default new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  plugins: plugins,
  modules: {
    search,
    connection,
    theme,
    snackbar,
    indices,
    query
  }
})
