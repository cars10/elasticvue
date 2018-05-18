import { DEFAULT_SEARCH_PARAMS } from '../../consts'

export const browse = {
  state: {
    q: DEFAULT_SEARCH_PARAMS.q,
    indices: DEFAULT_SEARCH_PARAMS.index,
    filter: ''
  },
  mutations: {
    setBrowseQ (state, q) {
      state.q = q
    },
    setBrowseIndices (state, indices) {
      state.indices = indices
    },
    setBrowseFilter (state, filter) {
      state.filter = filter
    },
    resetBrowse (state) {
      state.q = DEFAULT_SEARCH_PARAMS.q
      state.indices = DEFAULT_SEARCH_PARAMS.index
    }
  }
}
