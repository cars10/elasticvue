import { DEFAULT_HOST, HTTP_METHODS, REQUEST_DEFAULT_HEADERS } from '../../consts'

export const query = {
  namespaced: true,
  state: {
    host: DEFAULT_HOST,
    method: HTTP_METHODS[0],
    stringifiedParams: JSON.stringify({ format: 'json' }, null, '\t'),
    stringifiedHeaders: JSON.stringify(REQUEST_DEFAULT_HEADERS, null, '\t')
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
    },
    setStringifiedHeaders (state, headers) {
      state.stringifiedHeaders = headers
    }
  }
}
