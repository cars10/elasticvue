import { HTTP_METHODS } from '@/consts'

export const queryRest = {
  namespaced: true,
  state: {
    path: '',
    method: HTTP_METHODS[1],
    requestBody: '{}',
    vertical: false
  },
  mutations: {
    setPath (state, path) {
      state.path = path
    },
    setMethod (state, method) {
      state.method = method
    },
    setRequestBody (state, params) {
      state.requestBody = params
    },
    setVertical (state, vertical) {
      state.vertical = vertical
    }
  }
}
