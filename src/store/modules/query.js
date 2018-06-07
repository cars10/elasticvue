import { DEFAULT_HOST } from '../../consts'

export const query = {
  state: {
    host: DEFAULT_HOST,
    method: null,
    stringifiedParams: JSON.stringify({})
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
