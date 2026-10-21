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

type ShardRecoveryState = {
  filter: string
  stage: string | null
  activeOnly: boolean
  stickyTableHeader: boolean
} & PaginationStorePartial &
  ReloadIntervalStorePartial

export const useShardRecoveryStore = () => {
  const connectionStore = useConnectionStore()
  const clusterUuid = connectionStore.activeCluster?.uuid || ''
  return defineStore(`shardRecovery-${clusterUuid}`, {
    state: (): ShardRecoveryState => ({
      filter: '',
      stage: null,
      activeOnly: true,
      stickyTableHeader: false,
      pagination: paginationStoreDefaultProps(),
      reloadInterval: DEFAULT_RELOAD_INTERVAL
    }),
    persist: {
      pick: ['filter', 'stage', 'activeOnly', 'stickyTableHeader', ...persistPaginationProps(), ...persistReloadIntervalProps()],
      key: `shardRecovery-${clusterUuid}`
    }
  })()
}
