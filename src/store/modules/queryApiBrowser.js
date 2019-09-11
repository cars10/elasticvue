export const queryApiBrowser = {
  namespaced: true,
  state: {
    method: 'info',
    stringifiedParams: '{}',
    vertical: true
  },
  mutations: {
    setMethod (state, method) {
      state.method = method
    },
    setStringifiedParams (state, params) {
      state.stringifiedParams = params
    },
    setVertical (state, vertical) {
      state.vertical = vertical
    }
  }
}
