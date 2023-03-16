export const reloadHomePage = (router, instanceId) => {
  try {
    const currentRoute = router.currentRoute.value
    if (currentRoute.name === 'home' && currentRoute.params.instanceId === instanceId) {
      window.location.reload()
    } else {
      const route = { name: currentRoute.name || 'home', params: { instanceId } }
      const url = router.resolve(route).href
      window.location.replace(url)
    }
  } catch (e) {
    console.log(e)
  }
}
