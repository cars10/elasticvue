// mock URL.createObjectURL for ace editor
Object.defineProperty(window.URL, 'createObjectURL', {
  writable: true,
  value: () => true
})

Object.defineProperty(window, 'scrollBy', {
  writable: true,
  value: () => true
})
