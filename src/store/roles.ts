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

type RolesState = {
  filter: string
} & PaginationStorePartial &
  ReloadIntervalStorePartial

export const useRolesStore = () => {
  const connectionStore = useConnectionStore()
  const clusterId = connectionStore.activeClusterId || ''
  return defineStore(`roles-${clusterId}`, {
    state: (): RolesState => ({
      filter: '',
      reloadInterval: DEFAULT_RELOAD_INTERVAL,
      pagination: paginationStoreDefaultProps('name')
    }),
    persist: {
      pick: ['filter', ...persistReloadIntervalProps(), ...persistPaginationProps()],
      key: `roles-${clusterId}`
    }
  })()
}
