import { defineStore } from 'pinia'
import { DEFAULT_PAGINATION, DEFAULT_SEARCH_QUERY } from '../consts'

export const useSearchStore = defineStore('search', {
  state: () => ({
    q: '*',
    indices: '*',
    searchQuery: DEFAULT_SEARCH_QUERY,
    searchQueryCollapsed: false,
    filter: '',
    visibleColumns: [],
    stickyTableHeader: false,
    pagination: DEFAULT_PAGINATION
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
      'pagination',
      'visibleColumns'
    ]
  }
})
