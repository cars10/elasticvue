export const queryApiBrowser = {
  namespaced: true,
  state: {
    method: 'info',
    stringifiedParams: JSON.stringify({ format: 'json' }, null, '\t')
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
