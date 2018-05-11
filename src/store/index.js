import Vue from 'vue'
import Vuex from 'vuex'
import { plugins } from './plugins'
import { search } from './modules/search'
import { connection } from './modules/connection'
import { theme } from './modules/theme'
import { snackbar } from './modules/snackbar'

Vue.use(Vuex)

export default new Vuex.Store({
  plugins: plugins,
  modules: {
    search: search,
    connection: connection,
    theme: theme,
    snackbar: snackbar
  }
})
