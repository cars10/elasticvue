import { defineStore } from 'pinia'
import { DEFAULT_HIDE_INDICES_REGEX } from '../consts'
import { useConnectionStore } from './connection'

type IndicesState = {
  filter: string
  showHiddenIndices: boolean
  stickyTableHeader: boolean
  hideIndicesRegex: string
  pagination: any
  rowsPerPageAccepted: boolean
}

export const useIndicesStore = () => {
  const connectionStore = useConnectionStore()
  const clusterUuid = connectionStore.activeCluster?.uuid || ''
  return defineStore(`indices-${clusterUuid}`, {
    state: (): IndicesState => ({
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
      ],
      key: `indices-${clusterUuid}`
    }
  })()
}
