export const query = {
  state: {
    host: '',
    method: '',
    methodParams: ''
  },
  mutations: {
    setHost (state, host) {
      state.host = host
    },
    setMethod (state, method) {
      state.method = method
    },
    setMethodParams (state, methodParams) {
      state.methodParams = methodParams
    }
  }
}
