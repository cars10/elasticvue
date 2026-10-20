import { createRouter, createWebHashHistory, createWebHistory, RouteLocation } from 'vue-router'
import ClusterIndices from './components/indices/ClusterIndices.vue'
import IndexTemplates from './components/indextemplates/IndexTemplates.vue'
import GlobalSettings from './components/settings/GlobalSettings.vue'
import IndexShards from './components/shards/IndexShards.vue'
import HomePage from './components/home/HomePage.vue'
import ClusterNodes from './components/nodes/ClusterNodes.vue'
import RestQuery from './components/rest/RestQuery.vue'
import NestedView from './components/base/NestedView.vue'
import { useConnectionStore } from './store/connection'
import WelcomePage from './components/welcome/WelcomePage.vue'
import SnapshotRepositories from './components/repositories/SnapshotRepositories.vue'
import RepositorySnapshots from './components/snapshots/RepositorySnapshots.vue'
import ClusterUsers from './components/users/ClusterUsers.vue'
import ClusterRoles from './components/roles/ClusterRoles.vue'
import SearchDocuments from './components/search/SearchDocuments.vue'
import ShardRecovery from './components/shardrecovery/ShardRecovery.vue'
import { buildConfig } from './buildConfig.ts'
import ClusterTools from './components/tools/ClusterTools.vue'

const routes = [
  {
    path: '/',
    redirect: () => {
      const connectionStore = useConnectionStore()
      const cluster = connectionStore.checkAndSetActiveCluster()

      if (cluster) return { name: 'home', params: { clusterIndex: connectionStore.activeClusterIndex } }
      return { name: 'welcome' }
    }
  },
  {
    path: '/redirect_to_cluster',
    redirect: (to: RouteLocation) => {
      const connectionStore = useConnectionStore()
      const clusterName = typeof to.query.name === 'string' ? to.query.name.trim() : ''

      if (clusterName && connectionStore.setActiveClusterByName(clusterName)) {
        return { name: 'home', params: { clusterIndex: connectionStore.activeClusterIndex }, query: {} }
      }

      const cluster = connectionStore.checkAndSetActiveCluster()
      if (cluster) return { name: 'home', params: { clusterIndex: connectionStore.activeClusterIndex }, query: {} }
      return { name: 'welcome' }
    }
  },
  {
    path: '/cluster/:clusterIndex',
    component: NestedView,
    children: [
      { path: '', name: 'home', component: HomePage },
      { path: 'indices', name: 'indices', component: ClusterIndices },
      { path: 'index_templates', name: 'index_templates', component: IndexTemplates },
      { path: 'settings', name: 'settings', component: GlobalSettings },
      { path: 'shards', name: 'shards', component: IndexShards },
      { path: 'shards/recovery', name: 'shard_recovery', component: ShardRecovery },
      { path: 'nodes', name: 'nodes', component: ClusterNodes },
      { path: 'search', name: 'search', component: SearchDocuments },
      { path: 'rest', name: 'rest', component: RestQuery },
      { path: 'tools', name: 'tools', component: ClusterTools },
      { path: 'snapshot_repositories', name: 'snapshot_repositories', component: SnapshotRepositories },
      { path: 'snapshot_repositories/:repositoryName', name: 'snapshots', component: RepositorySnapshots },
      { path: 'users', name: 'users', component: ClusterUsers },
      { path: 'roles', name: 'roles', component: ClusterRoles }
    ],
    beforeEnter: (to: RouteLocation) => {
      const connectionStore = useConnectionStore()
      const numInstances = connectionStore.clusters.length
      if (numInstances === 0) return { name: 'welcome' }

      const clusterIndexParam = Array.isArray(to.params.clusterIndex) ? to.params.clusterIndex[0] : to.params.clusterIndex
      const indexValid = connectionStore.validateAndSetClusterIndex(clusterIndexParam)

      if (indexValid) return
      return { name: 'home', params: { clusterIndex: 0 } }
    }
  },
  {
    path: '/welcome',
    name: 'welcome',
    component: WelcomePage,
    beforeEnter: (_to: RouteLocation) => {
      const connectionStore = useConnectionStore()
      const cluster = connectionStore.checkAndSetActiveCluster()

      if (cluster) return { name: 'home', params: { clusterIndex: connectionStore.activeClusterIndex } }
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/cluster/0'
  }
]

const history =
  buildConfig.router.mode === 'webHashHistory'
    ? createWebHashHistory(buildConfig.router.base)
    : createWebHistory(buildConfig.router.base)
const router = createRouter({
  history,
  routes
})

router.afterEach((to) => {
  document.title = to.name ? `elasticvue | ${String(to.name)}` : 'elasticvue'
})

export default router
