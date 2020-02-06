import Vue from 'vue'
import Router from 'vue-router'
import Setup from '@/views/Setup'
import Home from '@/views/Home'
import Search from '@/views/Search'
import Document from '@/views/Document'
import Indices from '@/views/Indices'
import Index from '@/views/Index'
import IndexStats from '@/views/IndexStats'
import Snapshots from '@/views/Snapshots'
import Repositories from '@/views/Repositories'
import Utilities from '@/views/Utilities'
import QueryRest from '@/views/QueryRest'
import QueryApiBrowser from '@/views/QueryApiBrowser'
import Nodes from '@/views/Nodes'
import Store from '@/store'

Vue.use(Router)

const router = new Router({
  mode: process.env.VUE_APP_ROUTER_MODE || 'history',
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/setup',
      name: 'Setup',
      component: Setup,
      beforeEnter: (to, from, next) => {
        if (Store.state.connection.wasConnected) {
          next('/')
        } else {
          next()
        }
      }
    },
    {
      path: '/nodes',
      name: 'Nodes',
      component: Nodes
    },
    {
      path: '/indices',
      name: 'Indices',
      component: Indices
    },
    {
      path: '/indices/:index',
      name: 'Index',
      component: Index
    },
    {
      path: '/indices/:index/stats',
      name: 'IndexStats',
      component: IndexStats
    },
    {
      path: '/search',
      name: 'Search',
      component: Search,
      props: true
    },
    {
      path: '/search/:index/:type/:id',
      name: 'Document',
      component: Document
    },
    {
      path: '/utilities',
      name: 'Utilities',
      component: Utilities
    },
    {
      path: '/snapshots',
      name: 'Snapshots',
      component: Snapshots
    },
    {
      path: '/snapshot_repositories',
      name: 'Repositories',
      component: Repositories
    },
    {
      path: '/query/rest',
      name: 'QueryRest',
      component: QueryRest
    },
    {
      path: '/query/api_browser',
      name: 'QueryApiBrowser',
      component: QueryApiBrowser
    },
    {
      path: '*',
      beforeEnter: (to, from, next) => {
        next('/') // redirect "404" to root url
      }
    }
  ]
})

router.beforeEach((to, from, next) => {
  if (!Store.state.connection.wasConnected && to.name !== 'Setup') {
    next('setup')
  } else {
    next()
  }
})

export default router
