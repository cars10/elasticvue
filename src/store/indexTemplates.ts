import { defineStore } from 'pinia'
import { useConnectionStore } from './connection'

type IndexTemplatesState = {
  filter: string
  showHiddenIndices: boolean
  stickyTableHeader: boolean
  pagination: any
}

export const useIndexTemplatesStore = () => {
  const connectionStore = useConnectionStore()
  const clusterUuid = connectionStore.activeCluster?.uuid || ''
  return defineStore(`indexTemplates-${clusterUuid}`, {
    state: (): IndexTemplatesState => ({
      filter: '',
      showHiddenIndices: false,
      stickyTableHeader: false,
      pagination: {
        sortBy: 'name',
        descending: false,
        rowsPerPage: 10
      }
    }),
    persist: {
      pick: [
        'filter',
        'showHiddenIndices',
        'stickyTableHeader',
        'pagination.sortBy',
        'pagination.descending',
        'pagination.rowsPerPage'
      ],
      key: `indexTemplates-${clusterUuid}`
    }
  })()
}
