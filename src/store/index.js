import Vue from 'vue'
import Vuex from 'vuex'
import { plugins } from './plugins'
import { browse } from './modules/browse'
import { connection } from './modules/connection'
import { theme } from './modules/theme'

Vue.use(Vuex)

export default new Vuex.Store({
  plugins: plugins,
  modules: {
    browse: browse,
    connection: connection,
    theme: theme
  }
})
