import { HTTP_METHODS } from '@/consts'

const DEFAULT_REQUEST = {
  path: '',
  method: HTTP_METHODS[0],
  body: ''
}

export const queryRest = {
  namespaced: true,
  state: {
    request: Object.assign({}, DEFAULT_REQUEST),
    vertical: false
  },
  mutations: {
    setRequest (state, request) {
      state.request = request
    },
    setVertical (state, vertical) {
      state.vertical = vertical
    },
    resetRequest (state) {
      state.request = Object.assign({}, DEFAULT_REQUEST)
    }
  }
}
