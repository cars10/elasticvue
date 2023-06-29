import { createRouter, createWebHashHistory, createWebHistory, RouteLocation } from 'vue-router'
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
import SnapshotRepositories from './components/repositories/SnapshotRepositories.vue'
import RepositorySnapshots from './components/snapshots/RepositorySnapshots.vue'
import SearchDocuments from './components/search/SearchDocuments.vue'
import { buildConfig } from './buildConfig.ts'

const routes = [
  {
    path: '/',
    redirect: () => {
      const connectionStore = useConnectionStore()
      const cluster = connectionStore.checkAndSetActiveCluster()

      if (cluster) return ({ name: 'home', params: { clusterIndex: connectionStore.activeClusterIndex } })
      return { name: 'welcome' }
    }
  },
  {
    path: '/cluster/:clusterIndex',
    component: NestedView,
    children: [
      { path: '', name: 'home', component: HomeStatus },
      { path: 'indices', name: 'indices', component: ClusterIndices },
      { path: 'index_templates', name: 'index_templates', component: IndexTemplates },
      { path: 'settings', name: 'settings', component: GlobalSettings },
      { path: 'shards', name: 'shards', component: IndexShards },
      { path: 'nodes', name: 'nodes', component: ClusterNodes },
      { path: 'search', name: 'search', component: SearchDocuments },
      { path: 'rest', name: 'rest', component: RestQuery },
      { path: 'snapshot_repositories', name: 'snapshot_repositories', component: SnapshotRepositories },
      { path: 'snapshot_repositories/:repositoryName', name: 'snapshots', component: RepositorySnapshots },
    ],
    beforeEnter: (to: RouteLocation, _from: RouteLocation, next: any) => {
      const connectionStore = useConnectionStore()
      const numInstances = connectionStore.clusters.length
      if (numInstances === 0) return next('welcome')

      const clusterIndexParam = Array.isArray(to.params.clusterIndex) ? to.params.clusterIndex[0] : to.params.clusterIndex
      const indexValid = connectionStore.validateAndSetClusterIndex(clusterIndexParam)

      if (indexValid) return next()
      next({ name: 'home', params: { clusterIndex: 0 } })
    }
  },
  {
    path: '/welcome',
    name: 'welcome',
    component: WelcomePage,
    beforeEnter: (_to: RouteLocation, _from: RouteLocation, next: any) => {
      const connectionStore = useConnectionStore()
      const cluster = connectionStore.checkAndSetActiveCluster()

      if (cluster) return next({ name: 'home', params: { clusterIndex: connectionStore.activeClusterIndex } })
      next()
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/cluster/0'
  }
]

const history = buildConfig.router.mode === 'webHashHistory' ? createWebHashHistory() : createWebHistory()
const router = createRouter({
  history,
  routes,
})

router.afterEach((to) => {
  document.title = to.name ? `elasticvue | ${String(to.name)}` : 'elasticvue'
})

export default router
