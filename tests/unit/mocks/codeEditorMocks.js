// mock URL.createObjectURL for ace editor
Object.defineProperty(window.URL, 'createObjectURL', {
  value: () => {
  }
})
