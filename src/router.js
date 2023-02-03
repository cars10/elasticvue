import { createRouter, createWebHashHistory } from 'vue-router'
import ClusterIndices from './components/indices/ClusterIndices.vue'
import IndexTemplates from './components/indextemplates/IndexTemplates.vue'
import GlobalSettings from './components/settings/GlobalSettings.vue'
import IndexShards from './components/shards/IndexShards.vue'
import HomeStatus from './components/home/HomeStatus.vue'
import ClusterNodes from './components/nodes/ClusterNodes.vue'
import RestQuery from './components/rest/RestQuery.vue'

const routes = [
  { path: '/', component: HomeStatus },
  { path: '/indices', component: ClusterIndices },
  { path: '/index_templates', component: IndexTemplates },
  { path: '/settings', component: GlobalSettings },
  { path: '/shards', component: IndexShards },
  { path: '/nodes', component: ClusterNodes },
  { path: '/rest', component: RestQuery },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
