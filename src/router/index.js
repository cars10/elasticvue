import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import Browse from '@/components/Browse'
import Document from '@/components/Browse/Document'
import Indices from '@/components/Indices'

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
      path: '/browse',
      name: 'Browse',
      component: Browse
    },
    {
      path: '/documents/:index/:type/:id',
      name: 'Document',
      component: Document
    }
  ]
})
