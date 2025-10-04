import { defineStore } from 'pinia'
import { DEFAULT_PAGINATION, DEFAULT_SEARCH_QUERY, DEFAULT_DOCUMENT_FIELD_MAX_LENGTH } from '../consts'
import { useConnectionStore } from './connection.ts'



export type SortOrder = 'asc' | 'desc' | null

export type ColumnSort = {
  column: string
  order: SortOrder
  priority?: number
}


type SearchState = {
  localizeTimestamp: boolean
  q: string
  filter: string
  indices: string
  searchQuery: string
  searchQueryCollapsed: boolean
  columns: string[]
  columnOrder: string[]
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
      columnOrder: [],
      stickyTableHeader: false,
      pagination: Object.assign({}, DEFAULT_PAGINATION),
      rowsPerPageAccepted: false,
      documentFieldMaxLength: DEFAULT_DOCUMENT_FIELD_MAX_LENGTH
    }),
    actions: {
      resetSearchQuery () {
        this.q = '*'
        this.searchQuery = DEFAULT_SEARCH_QUERY
        this.pagination = Object.assign({}, DEFAULT_PAGINATION)
      },
      toggleColumnSort (column: string) {
        const existingSort = this.pagination.columnSorts.find((sort:ColumnSort) => sort.column === column)
        
        if (!existingSort) {
          // Nouvelle colonne : ajouter avec ordre 'asc'
          const newPriority = this.pagination.columnSorts.length + 1
          this.pagination.columnSorts.push({ column, order: 'asc', priority: newPriority })
        } else {
          // Colonne existante : changer l'ordre
          if (existingSort.order === 'asc') {
            existingSort.order = 'desc'
          } else if (existingSort.order === 'desc') {
            // Supprimer la colonne du tri
            this.pagination.columnSorts = this.pagination.columnSorts.filter((sort:ColumnSort) => sort.column !== column)
            this.updateSortPriorities()
          }
        }
      },
      updateSortPriorities () {
        this.pagination.columnSorts.forEach((sort:ColumnSort, index:number) => {
          sort.priority = index + 1
        })
      },
      clearAllSorts () {
        this.pagination.columnSorts = []
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
        'columnOrder',
        'visibleColumns',
        'rowsPerPageAccepted',
        'documentFieldMaxLength'
      ],
      key: `search-${clusterUuid}`
    }
  })()
}