import Vue from 'vue'
import Vuex from 'vuex'
import { plugins } from './plugins'
import { codeEditor } from '@/store/modules/codeEditor'
import { connection } from './modules/connection'
import { indices } from './modules/indices'
import { nodes } from './modules/nodes'
import { queryRest } from './modules/queryRest'
import { search } from './modules/search'
import { snackbar } from './modules/snackbar'
import { theme } from './modules/theme'
import { repositories } from './modules/repositories'
import { snapshots } from './modules/snapshots'

Vue.use(Vuex)

export default new Vuex.Store({
  plugins: plugins,
  modules: {
    codeEditor,
    connection,
    indices,
    nodes,
    queryRest,
    search,
    repositories,
    snapshots,
    snackbar,
    theme
  }
})
