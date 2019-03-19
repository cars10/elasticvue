import { HTTP_METHODS } from '../../consts'

export const queryRest = {
  namespaced: true,
  state: {
    method: HTTP_METHODS[0],
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
