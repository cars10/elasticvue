import { defineStore } from 'pinia'
import { useConnectionStore } from './connection'
import {
  persistPaginationProps,
  type PaginationStorePartial,
  type ReloadIntervalStorePartial,
  persistReloadIntervalProps,
  paginationStoreDefaultProps
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
      reloadInterval: null,
      pagination: paginationStoreDefaultProps('id')
    }),
    persist: {
      pick: ['filter', ...persistReloadIntervalProps(), ...persistPaginationProps()],
      key: `snapshots-${clusterUuid}`
    }
  })()
}
