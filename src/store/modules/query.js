import { DEFAULT_HOST, REQUEST_DEFAULTS } from '../../consts'

export const query = {
  state: {
    host: DEFAULT_HOST,
    method: null,
    stringifiedParams: JSON.stringify(REQUEST_DEFAULTS)
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
    }
  }
}
