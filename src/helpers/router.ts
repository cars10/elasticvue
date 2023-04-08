import { Router } from 'vue-router'

export const reloadHomePage = (router: Router, clusterIndex: number) => {
  try {
    const currentRoute = router.currentRoute.value
    // @ts-ignore
    if (currentRoute.name === 'home' && currentRoute.params.clusterIndex === clusterIndex) {
      window.location.reload()
    } else {
      const route = { name: currentRoute.name || 'home', params: { clusterIndex } }
      const url = router.resolve(route).href
      window.location.replace(url)
    }
  } catch (e) {
    console.log(e)
  }
}
