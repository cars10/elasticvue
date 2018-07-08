import { DEFAULT_DATA_TABLE_PAGINATION, DEFAULT_SEARCH_PARAMS } from '../../consts'

export const search = {
  state: {
    q: DEFAULT_SEARCH_PARAMS.q,
    indices: DEFAULT_SEARCH_PARAMS.index,
    size: DEFAULT_SEARCH_PARAMS.size,
    sourceInclude: '',
    filter: '',
    pagination: DEFAULT_DATA_TABLE_PAGINATION
  },
  mutations: {
    setSearchQ (state, q) {
      state.q = q
    },
    setSearchIndices (state, indices) {
      state.indices = indices
    },
    setSearchSize (state, size) {
      state.size = size
    },
    setSearchSourceInclude (state, sourceInclude) {
      state.sourceInclude = sourceInclude
    },
    setSearchFilter (state, filter) {
      state.filter = filter
    },
    setSearchPagination (state, pagination) {
      state.pagination = pagination
    },
    resetSearch (state) {
      state.q = DEFAULT_SEARCH_PARAMS.q
      state.indices = DEFAULT_SEARCH_PARAMS.index
      state.size = DEFAULT_SEARCH_PARAMS.size
      state.sourceInclude = ''
      state.filter = ''
      state.pagination = DEFAULT_DATA_TABLE_PAGINATION
    }
  }
}
