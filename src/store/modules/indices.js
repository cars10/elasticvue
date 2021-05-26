import { DEFAULT_DATA_TABLE_OPTIONS } from '@/consts'

export const indices = {
  namespaced: true,
  state: {
    showHiddenIndices: false,
    hideIndicesRegex: '\\..*',
    filter: '',
    options: Object.assign({}, DEFAULT_DATA_TABLE_OPTIONS, { sortBy: ['index'] })
  },
  mutations: {
    setShowHiddenIndices (state, showHiddenIndices) {
      state.showHiddenIndices = showHiddenIndices
    },
    setHideIndicesRegex (state, hideIndicesRegex) {
      state.hideIndicesRegex = hideIndicesRegex
    },
    setFilter (state, filter) {
      state.filter = filter
    },
    setOptions (state, options) {
      state.options = options
    }
  }
}
