import { defineStore } from 'pinia'
import { DEFAULT_HIDE_INDICES_REGEX } from '../consts'
import { useConnectionStore } from './connection'
import {
  PaginationStorePartial,
  ReloadIntervalStorePartial,
  paginationStoreDefaultProps,
  persistPaginationProps,
  persistReloadIntervalProps
} from './shared'

type IndicesState = {
  filter: string
  showHiddenIndices: boolean
  stickyTableHeader: boolean
  hideIndicesRegex: string
  rowsPerPageAccepted: boolean
} & PaginationStorePartial &
  ReloadIntervalStorePartial

export const useIndicesStore = () => {
  const connectionStore = useConnectionStore()
  const clusterUuid = connectionStore.activeCluster?.uuid || ''
  return defineStore(`indices-${clusterUuid}`, {
    state: (): IndicesState => ({
      filter: '',
      showHiddenIndices: false,
      stickyTableHeader: false,
      hideIndicesRegex: DEFAULT_HIDE_INDICES_REGEX,
      pagination: paginationStoreDefaultProps('index'),
      rowsPerPageAccepted: false,
      reloadInterval: null
    }),
    persist: {
      pick: [
        'filter',
        'showHiddenIndices',
        'stickyTableHeader',
        'hideIndicesRegex',
        ...persistPaginationProps(),
        ...persistReloadIntervalProps(),
        'rowsPerPageAccepted'
      ],
      key: `indices-${clusterUuid}`
    }
  })()
}
