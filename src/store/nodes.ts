import { defineStore } from 'pinia'
import { DEFAULT_HIDE_NODE_ATTRIBUTES_REGEX } from '../consts'
import { useConnectionStore } from './connection'
import {
  persistPaginationProps,
  type PaginationStorePartial,
  type ReloadIntervalStorePartial,
  persistReloadIntervalProps,
  paginationStoreDefaultProps,
  DEFAULT_RELOAD_INTERVAL
} from './shared'

type NodesState = {
  filter: string
  nodeRoles: string[]
  hideAttributesRegex: string
} & PaginationStorePartial &
  ReloadIntervalStorePartial

export const useNodesStore = () => {
  const connectionStore = useConnectionStore()
  const clusterUuid = connectionStore.activeCluster?.uuid || ''
  return defineStore(`nodes-${clusterUuid}`, {
    state: (): NodesState => ({
      filter: '',
      nodeRoles: [],
      hideAttributesRegex: DEFAULT_HIDE_NODE_ATTRIBUTES_REGEX,
      reloadInterval: DEFAULT_RELOAD_INTERVAL,
      pagination: paginationStoreDefaultProps('name')
    }),
    persist: {
      pick: ['filter', 'nodeRoles', 'hideAttributesRegex', ...persistReloadIntervalProps(), ...persistPaginationProps()],
      key: `nodes-${clusterUuid}`
    }
  })()
}
