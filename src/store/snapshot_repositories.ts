import { defineStore } from 'pinia'
import { useConnectionStore } from './connection'
import {
  persistPaginationProps,
  type PaginationStorePartial,
  type ReloadIntervalStorePartial,
  persistReloadIntervalProps,
  paginationStoreDefaultProps
} from './shared'

type SnapshotRepositoriesState = {
  filter: string
} & PaginationStorePartial &
  ReloadIntervalStorePartial

export const useSnapshotRepositoriesStore = () => {
  const connectionStore = useConnectionStore()
  const clusterUuid = connectionStore.activeCluster?.uuid || ''
  return defineStore(`snapshot-repositories-${clusterUuid}`, {
    state: (): SnapshotRepositoriesState => ({
      filter: '',
      reloadInterval: null,
      pagination: paginationStoreDefaultProps('name')
    }),
    persist: {
      pick: ['filter', ...persistReloadIntervalProps(), ...persistPaginationProps()],
      key: `snapshot-repositories-${clusterUuid}`
    }
  })()
}
