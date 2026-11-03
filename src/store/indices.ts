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
  health: string | null
  showHiddenIndices: boolean
  stickyTableHeader: boolean
  hideIndicesRegex: string
  rowsPerPageAccepted: boolean
} & PaginationStorePartial &
  ReloadIntervalStorePartial

export const useIndicesStore = () => {
  const connectionStore = useConnectionStore()
  const clusterId = connectionStore.activeClusterId || ''
  return defineStore(`indices-${clusterId}`, {
    state: (): IndicesState => ({
      filter: '',
      health: null,
      showHiddenIndices: false,
      stickyTableHeader: false,
      hideIndicesRegex: DEFAULT_HIDE_INDICES_REGEX,
      pagination: paginationStoreDefaultProps('index'),
      rowsPerPageAccepted: false,
      reloadInterval: 30
    }),
    persist: {
      pick: [
        'filter',
        'health',
        'showHiddenIndices',
        'stickyTableHeader',
        'hideIndicesRegex',
        ...persistPaginationProps(),
        ...persistReloadIntervalProps(),
        'rowsPerPageAccepted'
      ],
      key: `indices-${clusterId}`
    }
  })()
}
