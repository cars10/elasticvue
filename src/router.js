import Vue from 'vue'
import Router from 'vue-router'
import Setup from '@/views/Setup'
import Home from '@/views/Home'
import Search from '@/views/Search'
import Document from '@/views/Document'
import Indices from '@/views/Indices'
import Snapshots from '@/views/Snapshots'
import Repositories from '@/views/Repositories'
import Utilities from '@/views/Utilities'
import QueryRest from '@/views/QueryRest'
import Nodes from '@/views/Nodes'
import Settings from '@/views/Settings'
import Store from '@/store'

Vue.use(Router)

const base = process.env.VUE_APP_PUBLIC_PATH || '/'

const router = new Router({
  mode: process.env.VUE_APP_ROUTER_MODE || 'history',
  base,
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
        if (Store.state.connection.instances.length > 0) {
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
      path: '/search',
      name: 'Search',
      component: Search,
      props: true
    },
    {
      path: '/search/:index/:type?/:id',
      name: 'Document',
      component: Document
    },
    {
      path: '/utilities',
      name: 'Utilities',
      component: Utilities
    },
    {
      path: '/settings',
      name: 'Settings',
      component: Settings
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
      path: '/rest',
      name: 'Rest',
      component: QueryRest
    },
    {
      path: '*',
      beforeEnter: (to, from, next) => {
        next(base) // redirect "404" to root url
      }
    }
  ]
})

router.beforeEach((to, from, next) => {
  if (!Store.state.connection.instances.length > 0 && to.name !== 'Setup') {
    next('setup')
  } else {
    next()
  }
})

router.afterEach((to, _from) => {
  Vue.nextTick(() => {
    document.title = to.name ? `elasticvue | ${to.name}` : 'elasticvue'
  })
})

export default router
