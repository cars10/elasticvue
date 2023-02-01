import { DEFAULT_DATA_TABLE_OPTIONS } from '@/consts'

export const nodes = {
  namespaced: true,
  state: {
    listType: 'grid',
    filter: '',
    pagination: Object.assign({}, DEFAULT_DATA_TABLE_OPTIONS, { sortBy: ['name'] })
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
    }
  }
}
