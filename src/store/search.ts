import { defineStore } from 'pinia'
import { DEFAULT_PAGINATION, DEFAULT_SEARCH_QUERY, DEFAULT_DOCUMENT_FIELD_MAX_LENGTH } from '../consts'
import { useConnectionStore } from './connection.ts'

type SearchState = {
  localizeTimestamp: boolean
  q: string
  filter: string
  indices: string
  searchQuery: string
  searchQueryCollapsed: boolean
  columns: string[]
  visibleColumns: string[]
  stickyTableHeader: boolean
  pagination: any
  rowsPerPageAccepted: boolean
  documentFieldMaxLength: number
}

export const useSearchStore = () => {
  const connectionStore = useConnectionStore()
  const clusterUuid = connectionStore.activeCluster?.uuid

  return defineStore('search', {
    state: (): SearchState => ({
      localizeTimestamp: true,
      q: '*',
      filter: '',
      indices: '*',
      searchQuery: DEFAULT_SEARCH_QUERY,
      searchQueryCollapsed: false,
      columns: [],
      visibleColumns: [],
      stickyTableHeader: false,
      pagination: Object.assign({}, DEFAULT_PAGINATION),
      rowsPerPageAccepted: false,
      documentFieldMaxLength: DEFAULT_DOCUMENT_FIELD_MAX_LENGTH
    }),
    actions: {
      resetSearchQuery () {
        this.searchQuery = DEFAULT_SEARCH_QUERY
        this.pagination = Object.assign({}, DEFAULT_PAGINATION)
      }
    },
    persist: {
      pick: [
        'localizeTimestamp',
        'q',
        'filter',
        'indices',
        'searchQuery',
        'searchQueryCollapsed',
        'stickyTableHeader',
        'pagination',
        'columns',
        'visibleColumns',
        'rowsPerPageAccepted',
        'documentFieldMaxLength'
      ],
      key: `search-${clusterUuid}`
    }
  })()
}