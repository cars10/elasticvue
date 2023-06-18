import { defineStore } from 'pinia'
import { DEFAULT_PAGINATION, DEFAULT_SEARCH_QUERY } from '../consts'
import { useConnectionStore } from './connection.ts'

type State = {
  q: string,
  indices: string,
  searchQuery: string,
  searchQueryCollapsed: boolean,
  columns: string[],
  visibleColumns: string[],
  stickyTableHeader: boolean,
  pagination: any
}

export const useSearchStore = () => {
  const connectionStore = useConnectionStore()
  const clusterUuid = connectionStore.activeCluster.uuid

  return defineStore('search', {
    state: (): State => ({
      q: '*',
      indices: '*',
      searchQuery: DEFAULT_SEARCH_QUERY,
      searchQueryCollapsed: false,
      columns: [],
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
        'columns',
        'visibleColumns'
      ],
      key: `search-${clusterUuid}`
    }
  })()
}