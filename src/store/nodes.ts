import { defineStore } from 'pinia'
import { DEFAULT_HIDE_NODE_ATTRIBUTES_REGEX } from '../consts'
import { useConnectionStore } from './connection'

type NodesState = {
  filter: string
  hideAttributesRegex: string
}

export const useNodesStore = () => {
  const connectionStore = useConnectionStore()
  const clusterUuid = connectionStore.activeCluster?.uuid || ''
  return defineStore(`nodes-${clusterUuid}`, {
    state: (): NodesState => ({
      filter: '',
      hideAttributesRegex: DEFAULT_HIDE_NODE_ATTRIBUTES_REGEX
    }),
    persist: {
      key: `nodes-${clusterUuid}`
    }
  })()
}
