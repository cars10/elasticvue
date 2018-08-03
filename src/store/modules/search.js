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
    selectedKeys: []
  },
  mutations: {
    setQ (state, q) {
      state.q = q
    },
    setIndices (state, indices) {
      state.indices = indices
      // state.selectedKeys = []
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
    setSelectedKeys (state, val) {
      state.selectedKeys = val
    },
    reset (state) {
      state.q = DEFAULT_SEARCH_PARAMS.q
      state.indices = DEFAULT_SEARCH_PARAMS.index
      state.size = DEFAULT_SEARCH_PARAMS.size
      state.sourceInclude = ''
      state.filter = ''
      state.pagination = Object.assign({}, DEFAULT_DATA_TABLE_PAGINATION)
      state.stickyTableHeader = true
      state.selectedKeys = []
    }
  }
}
