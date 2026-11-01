import { Router } from 'vue-router'
import { buildConfig } from '../buildConfig.ts'

export const reloadHomePage = (router: Router, clusterId: string, routeName?: string) => {
  try {
    const currentRoute = router.currentRoute.value
    if (currentRoute.name === 'home' && currentRoute.params.clusterId === clusterId) {
      router.go(0)
    } else {
      const route = { name: routeName || currentRoute.name || 'home', params: { clusterId } }
      if (buildConfig.router.mode === 'webHashHistory') {
        router.push(route).then(() => router.go(0))
      } else {
        const url = router.resolve(route).href
        window.location.replace(url)
      }
    }
  } catch (e) {
    console.log(e)
  }
}
