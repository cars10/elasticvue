import { DEFAULT_DATA_TABLE_OPTIONS, DEFAULT_SEARCH_PARAMS } from '../../consts'

export const search = {
  namespaced: true,
  state: {
    q: DEFAULT_SEARCH_PARAMS.q,
    indices: DEFAULT_SEARCH_PARAMS.index,
    size: DEFAULT_SEARCH_PARAMS.size,
    source: '',
    filter: '',
    options: Object.assign({}, DEFAULT_DATA_TABLE_OPTIONS),
    stickyTableHeader: false,
    selectedMappings: [],
    mappings: []
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
    setSource (state, source) {
      state.source = source
    },
    setFilter (state, filter) {
      state.filter = filter
    },
    setOptions (state, options) {
      state.options = options
    },
    setStickyTableHeader (state, sticky) {
      state.stickyTableHeader = sticky
    },
    setSelectedMappings (state, val) {
      state.selectedMappings = val
    },
    setMappings (state, val) {
      state.mappings = val
    },
    reset (state) {
      state.q = DEFAULT_SEARCH_PARAMS.q
      state.indices = DEFAULT_SEARCH_PARAMS.index
      state.size = DEFAULT_SEARCH_PARAMS.size
      state.source = ''
      state.filter = ''
      state.options = Object.assign({}, DEFAULT_DATA_TABLE_OPTIONS)
      state.stickyTableHeader = true
      state.selectedMappings = []
      state.mappings = []
    }
  }
}
