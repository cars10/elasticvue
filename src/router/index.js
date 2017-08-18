import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import Browse from '@/components/Browse'
import Search from '@/components/Search'
import Document from '@/components/Browse/Document'

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
      path: '/browse',
      name: 'Browse',
      component: Browse
    },
    {
      path: '/search',
      name: 'Search',
      component: Search
    },
    {
      path: '/documents/:index/:type/:id',
      name: 'Document',
      component: Document
    }
  ]
})
