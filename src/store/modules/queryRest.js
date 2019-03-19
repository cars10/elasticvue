import { DEFAULT_HOST, HTTP_METHODS } from '../../consts'

export const queryRest = {
  namespaced: true,
  state: {
    host: DEFAULT_HOST,
    method: HTTP_METHODS[0],
    stringifiedParams: JSON.stringify({ format: 'json' }, null, '\t'),
  },
  mutations: {
    setHost (state, host) {
      state.host = host
    },
    setMethod (state, method) {
      state.method = method
    },
    setStringifiedParams (state, params) {
      state.stringifiedParams = params
    }
  }
}
