import { createRouter, createWebHashHistory } from 'vue-router'
import Indices from './components/indices/Indices.vue'
import IndexTemplates from './components/indextemplates/IndexTemplates.vue'
import Settings from './components/settings/Settings.vue'
import Shards from './components/shards/Shards.vue'
import HomeStatus from './components/home/HomeStatus.vue'

const routes = [
  { path: '/', component: HomeStatus },
  { path: '/indices', component: Indices },
  { path: '/index_templates', component: IndexTemplates },
  { path: '/settings', component: Settings },
  { path: '/shards', component: Shards },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
