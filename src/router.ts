import { createRouter, createWebHashHistory, createWebHistory, RouteLocation } from 'vue-router'
import HomePage from './components/home/HomePage.vue'
import NestedView from './components/base/NestedView.vue'
import { useConnectionStore } from './store/connection'
import { useClusterSession } from './store/clusterSession.ts'
import WelcomePage from './components/welcome/WelcomePage.vue'
import { buildConfig } from './buildConfig.ts'
import { ClusterCapabilities } from './helpers/capabilities.ts'

const ClusterIndices = () => import('./components/indices/ClusterIndices.vue')
const IndexTemplates = () => import('./components/indextemplates/IndexTemplates.vue')
const GlobalSettings = () => import('./components/settings/GlobalSettings.vue')
const IndexShards = () => import('./components/shards/IndexShards.vue')
const ClusterNodes = () => import('./components/nodes/ClusterNodes.vue')
const RestQuery = () => import('./components/rest/RestQuery.vue')
const SnapshotRepositories = () => import('./components/repositories/SnapshotRepositories.vue')
const RepositorySnapshots = () => import('./components/snapshots/RepositorySnapshots.vue')
const ClusterUsers = () => import('./components/users/ClusterUsers.vue')
const ClusterRoles = () => import('./components/roles/ClusterRoles.vue')
const SearchDocuments = () => import('./components/search/SearchDocuments.vue')
const ShardRecovery = () => import('./components/shardrecovery/ShardRecovery.vue')
const ClusterTools = () => import('./components/tools/ClusterTools.vue')
const ClusterTasks = () => import('./components/tasks/ClusterTasks.vue')
const ClustersPage = () => import('./components/clusters/ClustersPage.vue')

declare module 'vue-router' {
  interface RouteMeta {
    available?: (capabilities: ClusterCapabilities) => boolean
  }
}

const notServerless = { available: (c: ClusterCapabilities) => !c.serverless }

const routes = [
  {
    path: '/',
    redirect: () => {
      const connectionStore = useConnectionStore()
      const cluster = connectionStore.checkAndSetActiveCluster()

      if (cluster) return { name: 'home', params: { clusterId: connectionStore.activeClusterId } }
      return { name: 'welcome' }
    }
  },
  {
    path: '/redirect_to_cluster',
    redirect: (to: RouteLocation) => {
      const connectionStore = useConnectionStore()
      const clusterName = typeof to.query.name === 'string' ? to.query.name.trim() : ''

      if (clusterName && connectionStore.setActiveClusterByName(clusterName)) {
        return { name: 'home', params: { clusterId: connectionStore.activeClusterId }, query: {} }
      }

      const cluster = connectionStore.checkAndSetActiveCluster()
      if (cluster) return { name: 'home', params: { clusterId: connectionStore.activeClusterId }, query: {} }
      return { name: 'welcome' }
    }
  },
  {
    path: '/cluster/:clusterId',
    component: NestedView,
    children: [
      { path: '', name: 'home', component: HomePage },
      { path: 'indices', name: 'indices', component: ClusterIndices },
      { path: 'index_templates', name: 'index_templates', component: IndexTemplates },
      { path: 'settings', name: 'settings', component: GlobalSettings },
      { path: 'shards', name: 'shards', component: IndexShards, meta: notServerless },
      { path: 'shards/recovery', name: 'shard_recovery', component: ShardRecovery, meta: notServerless },
      { path: 'nodes', name: 'nodes', component: ClusterNodes, meta: notServerless },
      {
        path: 'tasks',
        name: 'tasks',
        component: ClusterTasks,
        meta: { available: (c: ClusterCapabilities) => c.tasks }
      },
      { path: 'search', name: 'search', component: SearchDocuments },
      { path: 'rest', name: 'rest', component: RestQuery },
      { path: 'tools', name: 'tools', component: ClusterTools, meta: notServerless },
      { path: 'clusters', name: 'clusters', component: ClustersPage },
      { path: 'snapshot_repositories', name: 'snapshot_repositories', component: SnapshotRepositories, meta: notServerless },
      {
        path: 'snapshot_repositories/:repositoryName',
        name: 'snapshots',
        component: RepositorySnapshots,
        meta: notServerless
      },
      {
        path: 'users',
        name: 'users',
        component: ClusterUsers,
        meta: { available: (c: ClusterCapabilities) => c.security.available && c.security.users }
      },
      {
        path: 'roles',
        name: 'roles',
        component: ClusterRoles,
        meta: { available: (c: ClusterCapabilities) => c.security.available }
      }
    ]
  },
  {
    path: '/welcome',
    name: 'welcome',
    component: WelcomePage,
    beforeEnter: (_to: RouteLocation) => {
      const connectionStore = useConnectionStore()
      const cluster = connectionStore.checkAndSetActiveCluster()

      if (cluster) return { name: 'home', params: { clusterId: connectionStore.activeClusterId } }
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
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

router.beforeEach((to: RouteLocation) => {
  const session = useClusterSession()
  if (typeof to.params.clusterId === 'undefined') {
    session.disconnect()
    return
  }

  const connectionStore = useConnectionStore()
  if (connectionStore.clusters.length === 0) return { name: 'welcome' }

  const param = Array.isArray(to.params.clusterId) ? to.params.clusterId[0] : to.params.clusterId
  if (connectionStore.setActiveCluster(param)) {
    session.connect(param)
    if (to.meta.available && !to.meta.available(session.capabilities)) return { name: 'home', params: { clusterId: param } }
    return
  }

  const legacyCluster = /^\d{1,3}$/.test(param) ? connectionStore.clusters[Number(param)] : undefined
  if (legacyCluster) {
    return { name: to.name ?? 'home', params: { ...to.params, clusterId: legacyCluster.id }, query: to.query, hash: to.hash }
  }

  return { name: 'home', params: { clusterId: connectionStore.clusters[0].id } }
})

const CHUNK_LOAD_ERROR = /dynamically imported module|importing a module script failed/i

router.onError((error, to) => {
  if (CHUNK_LOAD_ERROR.test(String(error?.message))) window.location.assign(router.resolve(to).href)
})

router.afterEach((to) => {
  document.title = to.name ? `elasticvue | ${String(to.name)}` : 'elasticvue'
})

export default router
