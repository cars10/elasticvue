import { DEFAULT_DATA_TABLE_OPTIONS } from '@/consts'

export const indexTemplates = {
  namespaced: true,
  state: {
    filter: '',
    options: Object.assign({}, DEFAULT_DATA_TABLE_OPTIONS, { sortBy: ['name'] })
  },
  mutations: {
    setFilter (state, filter) {
      state.filter = filter
    },
    setOptions (state, options) {
      state.options = options
    }
  }
}
