import { defineStore } from 'pinia'
import { useConnectionStore } from './connection'
import { ReloadIntervalStorePartial, persistReloadIntervalProps } from './shared'

type ShardsState = {
  filter: string
  health: string | null
  rows: 'indices' | 'nodes'
} & ReloadIntervalStorePartial

export const useShardsStore = () => {
  const connectionStore = useConnectionStore()
  const clusterUuid = connectionStore.activeCluster?.uuid || ''
  return defineStore(`shards-${clusterUuid}`, {
    state: (): ShardsState => ({
      filter: '',
      health: null,
      rows: 'indices',
      reloadInterval: 30
    }),
    persist: {
      pick: ['filter', 'health', 'rows', ...persistReloadIntervalProps()],
      key: `shards-${clusterUuid}`
    }
  })()
}
