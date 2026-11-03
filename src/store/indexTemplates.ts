import { defineStore } from 'pinia'
import { useConnectionStore } from './connection'
import {
  PaginationStorePartial,
  ReloadIntervalStorePartial,
  paginationStoreDefaultProps,
  persistPaginationProps,
  persistReloadIntervalProps
} from './shared'

type IndexTemplatesState = {
  filter: string
  showHiddenIndices: boolean
  stickyTableHeader: boolean
} & PaginationStorePartial &
  ReloadIntervalStorePartial

export const useIndexTemplatesStore = () => {
  const connectionStore = useConnectionStore()
  const clusterId = connectionStore.activeClusterId || ''
  return defineStore(`indexTemplates-${clusterId}`, {
    state: (): IndexTemplatesState => ({
      filter: '',
      showHiddenIndices: false,
      stickyTableHeader: false,
      reloadInterval: 30,
      pagination: paginationStoreDefaultProps('name')
    }),
    persist: {
      pick: ['filter', 'showHiddenIndices', 'stickyTableHeader', ...persistPaginationProps(), ...persistReloadIntervalProps()],
      key: `indexTemplates-${clusterId}`
    }
  })()
}
