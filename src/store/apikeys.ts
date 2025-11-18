import { defineStore } from 'pinia'
import { DEFAULT_HIDE_INDICES_REGEX } from '../consts'

type ApiKeysState = {
  filter: string
  showHiddenIndices: boolean
  stickyTableHeader: boolean
  hideIndicesRegex: string
  pagination: any
  rowsPerPageAccepted: boolean
}

export const useApiKeysStore = defineStore('apikeys', {
  state: (): ApiKeysState => ({
    filter: '',
    showHiddenIndices: false,
    stickyTableHeader: false,
    hideIndicesRegex: DEFAULT_HIDE_INDICES_REGEX,
    pagination: {
      sortBy: 'index',
      descending: false,
      rowsPerPage: 10
    },
    rowsPerPageAccepted: false
  }),
  persist: {
    pick: [
      'filter',
      'showHiddenIndices',
      'stickyTableHeader',
      'hideIndicesRegex',
      'pagination.sortBy',
      'pagination.descending',
      'pagination.rowsPerPage',
      'rowsPerPageAccepted'
    ]
  }
})
