import { defineStore } from 'pinia'
import { useConnectionStore } from './connection'
import {
  persistPaginationProps,
  type PaginationStorePartial,
  type ReloadIntervalStorePartial,
  persistReloadIntervalProps,
  paginationStoreDefaultProps,
  DEFAULT_RELOAD_INTERVAL
} from './shared'

type SnapshotRepositoriesState = {
  filter: string
} & PaginationStorePartial &
  ReloadIntervalStorePartial

export const useSnapshotRepositoriesStore = () => {
  const connectionStore = useConnectionStore()
  const clusterId = connectionStore.activeClusterId || ''
  return defineStore(`snapshot-repositories-${clusterId}`, {
    state: (): SnapshotRepositoriesState => ({
      filter: '',
      reloadInterval: DEFAULT_RELOAD_INTERVAL,
      pagination: paginationStoreDefaultProps('name')
    }),
    persist: {
      pick: ['filter', ...persistReloadIntervalProps(), ...persistPaginationProps()],
      key: `snapshot-repositories-${clusterId}`
    }
  })()
}
