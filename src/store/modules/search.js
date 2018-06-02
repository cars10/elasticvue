import { DEFAULT_SEARCH_PARAMS } from '../../consts'

export const search = {
  state: {
    q: DEFAULT_SEARCH_PARAMS.q,
    indices: DEFAULT_SEARCH_PARAMS.index,
    filter: ''
  },
  mutations: {
    setSearchQ (state, q) {
      state.q = q
    },
    setSearchIndices (state, indices) {
      state.indices = indices
    },
    setSearchFilter (state, filter) {
      state.filter = filter
    },
    resetSearch (state) {
      state.q = DEFAULT_SEARCH_PARAMS.q
      state.indices = DEFAULT_SEARCH_PARAMS.index
    }
  }
}
