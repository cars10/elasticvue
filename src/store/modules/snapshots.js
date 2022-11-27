import { DEFAULT_DATA_TABLE_OPTIONS } from '@/consts'

export const snapshots = {
  namespaced: true,
  state: {
    filter: '',
    pagination: Object.assign({}, DEFAULT_DATA_TABLE_OPTIONS, { sortBy: ['name'] })
  },
  mutations: {
    setFilter (state, filter) {
      state.filter = filter
    },
    setPagination (state, pagination) {
      state.pagination = pagination
    }
  }
}
