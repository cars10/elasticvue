import { defineStore } from 'pinia'
import { useConnectionStore } from './connection'
import {
  type PaginationStorePartial,
  type ReloadIntervalStorePartial,
  persistReloadIntervalProps,
  paginationStoreDefaultProps,
  DEFAULT_RELOAD_INTERVAL
} from './shared'

type SnapshotsState = {
  filter: string
} & PaginationStorePartial &
  ReloadIntervalStorePartial

export const useSnapshotsStore = () => {
  const connectionStore = useConnectionStore()
  const clusterUuid = connectionStore.activeCluster?.uuid || ''
  return defineStore(`snapshots-${clusterUuid}`, {
    state: (): SnapshotsState => ({
      filter: '',
      reloadInterval: DEFAULT_RELOAD_INTERVAL,
      pagination: paginationStoreDefaultProps('startTime', true)
    }),
    persist: {
      pick: ['filter', ...persistReloadIntervalProps()],
      key: `snapshots-${clusterUuid}`
    }
  })()
}
