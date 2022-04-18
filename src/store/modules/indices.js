import { DEFAULT_DATA_TABLE_OPTIONS, DEFAULT_HIDE_INDICES_REGEX } from '@/consts'

export const indices = {
  namespaced: true,
  state: {
    showHiddenIndices: false,
    stickyTableHeader: true,
    hideIndicesRegex: DEFAULT_HIDE_INDICES_REGEX,
    filter: '',
    options: Object.assign({}, DEFAULT_DATA_TABLE_OPTIONS, { sortBy: ['index'] })
  },
  mutations: {
    setShowHiddenIndices (state, showHiddenIndices) {
      state.showHiddenIndices = showHiddenIndices
    },
    setStickyTableHeader (state, stickyTableHeader) {
      state.stickyTableHeader = stickyTableHeader
    },
    setHideIndicesRegex (state, hideIndicesRegex) {
      state.hideIndicesRegex = hideIndicesRegex
    },
    resetHideIndicesRegex (state) {
      state.hideIndicesRegex = DEFAULT_HIDE_INDICES_REGEX
    },
    setFilter (state, filter) {
      state.filter = filter
    },
    setOptions (state, options) {
      state.options = options
    }
  }
}
