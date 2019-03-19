export const queryApiBrowser = {
  namespaced: true,
  state: {
    method: 'info',
    stringifiedParams: '{}'
  },
  mutations: {
    setMethod (state, method) {
      state.method = method
    },
    setStringifiedParams (state, params) {
      state.stringifiedParams = params
    }
  }
}
