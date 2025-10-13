import { defineStore } from 'pinia'
import { DEFAULT_PAGINATION, DEFAULT_SEARCH_QUERY, DEFAULT_DOCUMENT_FIELD_MAX_LENGTH } from '../consts'
import { useConnectionStore } from './connection.ts'



export type SortOrder = 'asc' | 'desc' | null

export type ColumnSort = {
  column: string
  order: SortOrder
  priority?: number
}


export type SearchState = {
  label: string
  name: string
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
  rowsPerPageAccepted: boolean,
  searchHistory: string[],
  searchResults: any,
  executeOnMount?: boolean
}

export const useSearchStore = () => {
  const connectionStore = useConnectionStore()
  const clusterUuid = connectionStore.activeCluster?.uuid

  return defineStore('search', {
    state: () => {
      const firstTabName = `tab-doc-${Date.now()}`
      return {
        localizeTimestamp: true,
        documentFieldMaxLength: DEFAULT_DOCUMENT_FIELD_MAX_LENGTH,
        activeTab: firstTabName,
        tabs: [
          {
            name: firstTabName,
            label: `Tab ${1}`,
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
            searchHistory: [],
            searchResults: null,
            executeOnMount: false
          }
        ] as SearchState[]
      }
    },
    actions: {
      resetSearchQuery (name: string) {
        const state = this.tabs.find(tab => tab.name === name)
        if (!state) return

        state.q = '*'
        state.searchQuery = DEFAULT_SEARCH_QUERY
        state.pagination = Object.assign({}, DEFAULT_PAGINATION)
      },
      toggleColumnSort (name: string, column: string) {
        const state = this.tabs.find(tab => tab.name === name)
        if (!state) return

        const existingSort = state.pagination.columnSorts.find((sort:ColumnSort) => sort.column === column)

        if (!existingSort) {
          // Nouvelle colonne : ajouter avec ordre 'asc'
          const newPriority = state.pagination.columnSorts.length + 1
          state.pagination.columnSorts.push({ column, order: 'asc', priority: newPriority })
        } else {
          // Colonne existante : changer l'ordre
          if (existingSort.order === 'asc') {
            existingSort.order = 'desc'
          } else if (existingSort.order === 'desc') {
            // Supprimer la colonne du tri
            state.pagination.columnSorts = state.pagination.columnSorts.filter((sort:ColumnSort) => sort.column !== column)
            this.updateSortPriorities(name)
          }
        }
      },
      updateSortPriorities (name: string) {
        const state = this.tabs.find(tab => tab.name === name)
        if (!state) return

        state.pagination.columnSorts.forEach((sort:ColumnSort, index:number) => {
          sort.priority = index + 1
        })
      },
      clearAllSorts(name: string) {
        const state = this.tabs.find(tab => tab.name === name)
        if (!state) return

        state.pagination.columnSorts = []
      }
    },
    persist: {
      key: `search-${clusterUuid}`
    }
  })()
}