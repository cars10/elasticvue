import Vue from 'vue'
import Router from 'vue-router'
import Setup from '@/views/Setup'
import Home from '@/views/Home'
import Search from '@/views/Search'
import Document from '@/views/Document'
import Indices from '@/views/Indices'
import IndexTemplates from '@/views/IndexTemplates'
import Snapshots from '@/views/Snapshots'
import Repositories from '@/views/Repositories'
import Utilities from '@/views/Utilities'
import QueryRest from '@/views/QueryRest'
import Nodes from '@/views/Nodes'
import Settings from '@/views/Settings'
import Shards from '@/views/Shards'
import NestedView from '@/views/NestedView'
import store from '@/store'
import ElasticsearchAdapter from '@/services/ElasticsearchAdapter'
import { DefaultClient } from '@/models/clients/DefaultClient'

Vue.use(Router)

const base = process.env.VUE_APP_PUBLIC_PATH || '/'

const router = new Router({
  mode: process.env.VUE_APP_ROUTER_MODE || 'history',
  base,
  routes: [
    {
      path: '/setup',
      name: 'Setup',
      component: Setup,
      beforeEnter: (to, from, next) => {
        if (store.state.connection.instances.length > 0) {
          next('/')
        } else {
          next()
        }
      }
    },
    {
      path: '/cluster/:instanceId',
      component: NestedView,
      props: (route) => ({ id: route.params.instanceId || store.state.connection.activeInstanceIdx }),
      children: [
        { path: '/', name: 'Home', component: Home },
        { path: 'nodes', name: 'Nodes', component: Nodes },
        { path: 'indices', name: 'Indices', component: Indices },
        { path: 'index_templates', name: 'IndexTemplates', component: IndexTemplates },
        { path: 'shards', name: 'Shards', component: Shards },
        { path: 'search', name: 'Search', component: Search, props: true },
        { path: 'search/:index/:type?/:id', name: 'Document', component: Document },
        { path: 'utilities', name: 'Utilities', component: Utilities },
        { path: 'settings', name: 'Settings', component: Settings },
        { path: 'snapshot_repositories', name: 'Repositories', component: Repositories },
        { path: 'snapshot_repositories/:repositoryName/snapshots', name: 'Snapshots', component: Snapshots },
        { path: 'rest', name: 'Rest', component: QueryRest }
      ]
    },
    {
      path: '*',
      beforeEnter: (to, from, next) => {
        next('/cluster/0/nodes')
      }
    }
  ]
})

router.beforeEach((to, from, next) => {
  if (to.name === 'Setup') return next()

  const numInstances = store.state.connection.instances.length
  if (numInstances === 0) return next('setup')

  let instanceId = to.params.instanceId
  try {
    instanceId = parseInt(instanceId)
  } catch (e) {
  }

  if (isNaN(instanceId) || (instanceId + 1) > numInstances || instanceId < 0) {
    return next({
      name: 'Home',
      params: { instanceId: 0 }
    })
  }

  store.commit('connection/setActiveInstanceIdx', instanceId)
  const adapter = new ElasticsearchAdapter(new DefaultClient(store.getters['connection/activeInstance']))
  store.commit('connection/setElasticsearchAdapter', adapter)

  next()
})

router.afterEach((to, _from) => {
  Vue.nextTick(() => {
    document.title = to.name ? `elasticvue | ${to.name}` : 'elasticvue'
  })
})

export default router
