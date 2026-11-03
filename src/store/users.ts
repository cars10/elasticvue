import { defineStore } from 'pinia'
import { useConnectionStore } from './connection'
import {
  type PaginationStorePartial,
  type ReloadIntervalStorePartial,
  persistPaginationProps,
  persistReloadIntervalProps,
  paginationStoreDefaultProps,
  DEFAULT_RELOAD_INTERVAL
} from './shared'

type UsersState = {
  filter: string
} & PaginationStorePartial &
  ReloadIntervalStorePartial

export const useUsersStore = () => {
  const connectionStore = useConnectionStore()
  const clusterId = connectionStore.activeClusterId || ''
  return defineStore(`users-${clusterId}`, {
    state: (): UsersState => ({
      filter: '',
      reloadInterval: DEFAULT_RELOAD_INTERVAL,
      pagination: paginationStoreDefaultProps('username')
    }),
    persist: {
      pick: ['filter', ...persistReloadIntervalProps(), ...persistPaginationProps()],
      key: `users-${clusterId}`
    }
  })()
}
