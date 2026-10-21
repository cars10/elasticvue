import { defineStore } from 'pinia'
import { useConnectionStore } from './connection'
import {
  PaginationStorePartial,
  ReloadIntervalStorePartial,
  paginationStoreDefaultProps,
  persistPaginationProps,
  persistReloadIntervalProps,
  DEFAULT_RELOAD_INTERVAL
} from './shared'

type IndexTemplatesState = {
  filter: string
  showHiddenIndices: boolean
  stickyTableHeader: boolean
} & PaginationStorePartial &
  ReloadIntervalStorePartial

export const useIndexTemplatesStore = () => {
  const connectionStore = useConnectionStore()
  const clusterUuid = connectionStore.activeCluster?.uuid || ''
  return defineStore(`indexTemplates-${clusterUuid}`, {
    state: (): IndexTemplatesState => ({
      filter: '',
      showHiddenIndices: false,
      stickyTableHeader: false,
      reloadInterval: DEFAULT_RELOAD_INTERVAL,
      pagination: paginationStoreDefaultProps('name')
    }),
    persist: {
      pick: ['filter', 'showHiddenIndices', 'stickyTableHeader', ...persistPaginationProps(), ...persistReloadIntervalProps()],
      key: `indexTemplates-${clusterUuid}`
    }
  })()
}
