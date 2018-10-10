import { DEFAULT_DATA_TABLE_PAGINATION } from '../../consts'

export const nodes = {
  namespaced: true,
  state: {
    listType: 'grid',
    filter: '',
    stickyTableHeader: true,
    pagination: Object.assign({}, DEFAULT_DATA_TABLE_PAGINATION, { sortBy: 'name' })
  },
  mutations: {
    setListType (state, listType) {
      state.listType = listType
    },
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
