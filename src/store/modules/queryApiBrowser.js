import { HTTP_METHODS } from '../../consts'

export const queryApiBrowser = {
  namespaced: true,
  state: {
    method: HTTP_METHODS[0],
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
