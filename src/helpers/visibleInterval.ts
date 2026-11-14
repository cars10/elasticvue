export const visibleInterval = (action: () => void, ms: number) => {
  let missed = false

  const tick = () => {
    if (document.hidden) {
      missed = true
      return
    }
    action()
  }

  const onVisibilityChange = () => {
    if (document.hidden || !missed) return
    missed = false
    action()
  }

  const id = setInterval(tick, ms)
  document.addEventListener('visibilitychange', onVisibilityChange)

  return () => {
    clearInterval(id)
    document.removeEventListener('visibilitychange', onVisibilityChange)
  }
}
