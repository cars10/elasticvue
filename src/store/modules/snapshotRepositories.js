import { DEFAULT_DATA_TABLE_PAGINATION } from '../../consts'

export const snapshotRepositories = {
  namespaced: true,
  state: {
    filter: '',
    pagination: Object.assign({}, DEFAULT_DATA_TABLE_PAGINATION, { sortBy: ['name'] }),
    stickyTableHeader: false
  },
  mutations: {
    setFilter (state, filter) {
      state.filter = filter
    },
    setPagination (state, pagination) {
      state.pagination = pagination
    },
    setStickyTableHeader (state, sticky) {
      state.stickyTableHeader = sticky
    }
  }
}
