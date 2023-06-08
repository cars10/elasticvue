export const debounce = (fn: any, timeout: number) => {
  let timerId: NodeJS.Timeout

  return function (...args: any[]) {
    clearTimeout(timerId)
    timerId = setTimeout(() => {
      fn(...args)
    }, timeout)
  }
}
