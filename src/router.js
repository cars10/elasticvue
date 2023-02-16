import { createRouter, createWebHistory } from 'vue-router'
import ClusterIndices from './components/indices/ClusterIndices.vue'
import IndexTemplates from './components/indextemplates/IndexTemplates.vue'
import GlobalSettings from './components/settings/GlobalSettings.vue'
import IndexShards from './components/shards/IndexShards.vue'
import HomeStatus from './components/home/HomeStatus.vue'
import ClusterNodes from './components/nodes/ClusterNodes.vue'
import RestQuery from './components/rest/RestQuery.vue'
import NestedView from './components/base/NestedView.vue'
import { useConnectionStore } from './store/connection'
import WelcomePage from './components/welcome/WelcomePage.vue'

const routes = [
  {
    path: '/cluster/:instanceId',
    component: NestedView,
    props: (route) => ({ id: route.params.instanceId }),
    children: [
      { path: '', name: 'home', component: HomeStatus },
      { path: 'indices', name: 'indices', component: ClusterIndices },
      { path: 'index_templates', name: 'index_templates', component: IndexTemplates },
      { path: 'settings', name: 'settings', component: GlobalSettings },
      { path: 'shards', name: 'shards', component: IndexShards },
      { path: 'nodes', name: 'nodes', component: ClusterNodes },
      { path: 'rest', name: 'rest', component: RestQuery },
    ]
  },
  { path: '/welcome', name: 'welcome', component: WelcomePage },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/cluster/0'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  if (to.name === 'welcome') return next()

  const connectionStore = useConnectionStore()
  const numInstances = connectionStore.clusters.length
  if (numInstances === 0) return next('welcome')

  let instanceId = to.params.instanceId
  try {
    instanceId = parseInt(instanceId)
  } catch (e) {
  }

  if (isNaN(instanceId) || (instanceId + 1) > numInstances || instanceId < 0) {
    return next({
      name: 'home',
      params: { instanceId: 0 }
    })
  }

  connectionStore.activeClusterIndex = instanceId

  next()
})

router.afterEach((to, _from) => {
  document.title = to.name ? `elasticvue | ${to.name}` : 'elasticvue'
})

export default router
