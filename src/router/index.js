import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import Browse from '@/components/Browse'
import Document from '@/components/Browse/Document'
import Indices from '@/components/Indices'
import Index from '@/components/Indices/Index'
import Utilities from '@/components/Utilities'

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
      path: '/browse',
      name: 'Browse',
      component: Browse,
      props: true
    },
    {
      path: '/documents/:index/:type/:id',
      name: 'Document',
      component: Document
    }, {
      path: '/utilities',
      name: 'Utilities',
      component: Utilities
    }
  ]
})
