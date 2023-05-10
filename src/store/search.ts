import { defineStore } from 'pinia'
import { DEFAULT_SEARCH_QUERY } from '../consts'

export const useSearchStore = defineStore('search', {
  state: () => ({
    q: '*',
    indices: '*',
    searchQuery: DEFAULT_SEARCH_QUERY,
    searchQueryCollapsed: false,
    filter: '',
    selectedColumns: [],
    columns: [],
    stickyTableHeader: true,
    pagination: {
      sortBy: '',
      descending: false,
      page: 1,
      rowsPerPage: 10,
      rowsNumber: -1
    }
  }),
  actions: {
    resetSearchQuery () {
      this.searchQuery = DEFAULT_SEARCH_QUERY
    }
  },
  persist: {
    paths: [
      'q',
      'indices',
      'searchQuery',
      'searchQueryCollapsed',
      'stickyTableHeader',
      'pagination'
    ]
  }
})
