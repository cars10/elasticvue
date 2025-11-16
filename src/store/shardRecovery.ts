import { defineStore } from 'pinia'
import { useConnectionStore } from './connection'

type ShardRecoveryState = {
  filter: string
  stickyTableHeader: boolean
  pagination: any
}

export const useShardRecoveryStore = () => {
  const connectionStore = useConnectionStore()
  const clusterUuid = connectionStore.activeCluster?.uuid || ''
  return defineStore(`shardRecovery-${clusterUuid}`, {
    state: (): ShardRecoveryState => ({
      filter: '',
      stickyTableHeader: false,
      pagination: {
        sortBy: 'start_time_in_millis',
        descending: false,
        rowsPerPage: 10
      }
    }),
    persist: {
      pick: ['filter', 'stickyTableHeader', 'pagination.sortBy', 'pagination.descending', 'pagination.rowsPerPage'],
      key: `shardRecovery-${clusterUuid}`
    }
  })()
}
