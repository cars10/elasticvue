import { DEFAULT_SEARCH_PARAMS } from '../../consts'

export const search = {
  state: {
    q: DEFAULT_SEARCH_PARAMS.q,
    indices: DEFAULT_SEARCH_PARAMS.index
  },
  mutations: {
    setQ (state, q) {
      state.q = q
    },
    setIndices (state, indices) {
      state.indices = indices
    },
    resetSearch (state) {
      state.q = DEFAULT_SEARCH_PARAMS.q
      state.indices = DEFAULT_SEARCH_PARAMS.index
    }
  }
}
