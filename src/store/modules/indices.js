import { DEFAULT_DATA_TABLE_PAGINATION } from '../../consts'

export const indices = {
  state: {
    filter: '',
    pagination: DEFAULT_DATA_TABLE_PAGINATION
  },
  mutations: {
    setIndicesFilter (state, filter) {
      state.filter = filter
    },
    setIndicesPagination (state, pagination) {
      state.pagination = pagination
    }
  }
}
