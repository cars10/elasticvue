import { defineStore } from 'pinia'
import { useConnectionStore } from './connection'
import {
  PaginationStorePartial,
  ReloadIntervalStorePartial,
  paginationStoreDefaultProps,
  persistPaginationProps,
  persistReloadIntervalProps
} from './shared'

type ShardRecoveryState = {
  filter: string
  stage: string | null
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
      stickyTableHeader: false,
      pagination: paginationStoreDefaultProps('start_time_in_millis'),
      reloadInterval: null
    }),
    persist: {
      pick: ['filter', 'stage', 'stickyTableHeader', ...persistPaginationProps(), ...persistReloadIntervalProps()],
      key: `shardRecovery-${clusterUuid}`
    }
  })()
}
