import { HTTP_METHODS } from '../../consts'

export const queryRest = {
  namespaced: true,
  state: {
    path: '',
    method: HTTP_METHODS[0],
    stringifiedParams: '{}',
    vertical: false
  },
  mutations: {
    setPath (state, path) {
      state.path = path
    },
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
