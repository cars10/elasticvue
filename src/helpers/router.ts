import { Router } from 'vue-router'

export const openCluster = (router: Router, clusterId: string, routeName?: string) => {
  const name = routeName || router.currentRoute.value.name || 'home'
  return router.push({ name, params: { clusterId } })
}
