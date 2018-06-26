import { DEFAULT_HOST, REQUEST_DEFAULT_BODY, REQUEST_DEFAULT_HEADERS } from '../../consts'

export const query = {
  state: {
    host: DEFAULT_HOST,
    method: null,
    stringifiedParams: JSON.stringify(REQUEST_DEFAULT_BODY, null, '\t'),
    stringifiedHeaders: JSON.stringify(REQUEST_DEFAULT_HEADERS, null, '\t')
  },
  mutations: {
    setQueryHost (state, host) {
      state.host = host
    },
    setQueryMethod (state, method) {
      state.method = method
    },
    setQueryStringifiedParams (state, params) {
      state.stringifiedParams = params
    },
    setQueryStringifiedHeaders (state, headers) {
      state.stringifiedHeaders = headers
    }
  }
}
