import { Router } from 'vue-router'
import { buildConfig } from '../buildConfig.ts'

export const reloadHomePage = (router: Router, clusterIndex: number) => {
  try {
    const currentRoute = router.currentRoute.value
    // @ts-ignore
    if (currentRoute.name === 'home' && currentRoute.params.clusterIndex === clusterIndex) {
      router.go(0)
    } else {
      const route = { name: currentRoute.name || 'home', params: { clusterIndex } }
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
