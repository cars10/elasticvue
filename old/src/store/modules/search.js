import { DEFAULT_DATA_TABLE_OPTIONS, DEFAULT_SEARCH_QUERY } from '@/consts'

export const search = {
  namespaced: true,
  state: {
    q: '*',
    indices: '',
    searchQuery: DEFAULT_SEARCH_QUERY,
    searchQueryCollapsed: false,
    filter: '',
    options: Object.assign({}, DEFAULT_DATA_TABLE_OPTIONS),
    selectedColumns: [],
    columns: [],
    stickyTableHeader: true
  },
  mutations: {
    setQ (state, q) {
      state.q = q
    },
    setIndices (state, indices) {
      state.indices = indices
    },
    setSearchQuery (state, searchQuery) {
      state.searchQuery = searchQuery
    },
    setSearchQueryCollapsed (state, val) {
      state.searchQueryCollapsed = val
    },
    setFilter (state, filter) {
      state.filter = filter
    },
    setOptions (state, options) {
      state.options = options
    },
    setSelectedColumns (state, val) {
      state.selectedColumns = val
    },
    setColumns (state, val) {
      state.columns = val
    },
    setStickyTableHeader (state, stickyTableHeader) {
      state.stickyTableHeader = stickyTableHeader
    }
  }
}
