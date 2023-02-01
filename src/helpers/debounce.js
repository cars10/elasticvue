export const debounce = (fn, timeout) => {
  let timerId

  return function (...args) {
    clearTimeout(timerId)
    timerId = setTimeout(() => {
      fn(...args)
    }, timeout)
  }
}
