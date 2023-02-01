import Vue from 'vue'
import Vuex from 'vuex'
import { plugins } from './plugins'
import { codeEditor } from './modules/codeEditor'
import { connection } from './modules/connection'
import { indices } from './modules/indices'
import { indexTemplates } from './modules/index_templates'
import { language } from './modules/language'
import { nodes } from './modules/nodes'
import { queryRest } from './modules/queryRest'
import { search } from './modules/search'
import { snackbar } from './modules/snackbar'
import { theme } from './modules/theme'
import { repositories } from './modules/repositories'
import { snapshots } from './modules/snapshots'
import { shards } from './modules/shards'

Vue.use(Vuex)

export default new Vuex.Store({
  plugins: plugins,
  modules: {
    codeEditor,
    connection,
    indices,
    indexTemplates,
    language,
    nodes,
    queryRest,
    search,
    repositories,
    snapshots,
    snackbar,
    shards,
    theme
  }
})
