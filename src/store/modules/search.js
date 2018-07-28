import { DEFAULT_DATA_TABLE_PAGINATION, DEFAULT_SEARCH_PARAMS } from '../../consts'

export const search = {
  namespaced: true,
  state: {
    q: DEFAULT_SEARCH_PARAMS.q,
    indices: DEFAULT_SEARCH_PARAMS.index,
    size: DEFAULT_SEARCH_PARAMS.size,
    sourceInclude: '',
    filter: '',
    pagination: Object.assign({}, DEFAULT_DATA_TABLE_PAGINATION),
    stickyTableHeader: true,
    showIndex: true,
    showScore: true
  },
  mutations: {
    setQ (state, q) {
      state.q = q
    },
    setIndices (state, indices) {
      state.indices = indices
    },
    setSize (state, size) {
      state.size = size
    },
    setSourceInclude (state, sourceInclude) {
      state.sourceInclude = sourceInclude
    },
    setFilter (state, filter) {
      state.filter = filter
    },
    setPagination (state, pagination) {
      state.pagination = pagination
    },
    setStickyTableHeader (state, sticky) {
      state.stickyTableHeader = sticky
    },
    setShowIndex (state, val) {
      state.showIndex = val
    },
    setShowScore (state, val) {
      state.showScore = val
    },
    reset (state) {
      state.q = DEFAULT_SEARCH_PARAMS.q
      state.indices = DEFAULT_SEARCH_PARAMS.index
      state.size = DEFAULT_SEARCH_PARAMS.size
      state.sourceInclude = ''
      state.filter = ''
      state.pagination = DEFAULT_DATA_TABLE_PAGINATION
    }
  }
}
