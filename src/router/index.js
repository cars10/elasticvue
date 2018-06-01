import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import Search from '@/components/Search'
import Document from '@/components/Search/Document'
import Indices from '@/components/Indices'
import Index from '@/components/Indices/Index'
import Utilities from '@/components/Utilities'
import Query from '@/components/Query'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
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
      path: '/query',
      name: 'Query',
      component: Query
    },
    {
      path: '*',
      beforeEnter: (to, from, next) => {
        if (to.query && to.query.route) {
          next(to.query.route)
        } else {
          next('/')
        }
      }
    }
  ]
})
