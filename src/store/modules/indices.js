import { DEFAULT_DATA_TABLE_PAGINATION } from '../../consts'

export const indices = {
  namespaced: true,
  state: {
    filter: '',
    pagination: DEFAULT_DATA_TABLE_PAGINATION
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
