import { DEFAULT_DATA_TABLE_OPTIONS } from '@/consts'

export const indices = {
  namespaced: true,
  state: {
    filter: '',
    options: Object.assign({}, DEFAULT_DATA_TABLE_OPTIONS, { sortBy: ['index'] })
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
