import { defineStore } from 'pinia'
import { useConnectionStore } from './connection'

type ShardsState = {
  filter: string
}

export const useShardsStore = () => {
  const connectionStore = useConnectionStore()
  const clusterUuid = connectionStore.activeCluster?.uuid || ''
  return defineStore(`shards-${clusterUuid}`, {
    state: (): ShardsState => ({
      filter: ''
    }),
    persist: {
      pick: ['filter'],
      key: `shards-${clusterUuid}`
    }
  })()
}
