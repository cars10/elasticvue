export const debounce = (fn: any, timeout: number) => {
  let timerId: number

  return function (...args: any[]) {
    clearTimeout(timerId)
    timerId = window.setTimeout(() => {
      fn(...args)
    }, timeout)
  }
}
