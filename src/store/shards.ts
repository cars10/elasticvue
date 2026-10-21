import { defineStore } from 'pinia'
import { useConnectionStore } from './connection'
import { ReloadIntervalStorePartial, persistReloadIntervalProps, DEFAULT_RELOAD_INTERVAL } from './shared'

type ShardsState = {
  filter: string
  health: string | null
} & ReloadIntervalStorePartial

export const useShardsStore = () => {
  const connectionStore = useConnectionStore()
  const clusterUuid = connectionStore.activeCluster?.uuid || ''
  return defineStore(`shards-${clusterUuid}`, {
    state: (): ShardsState => ({
      filter: '',
      health: null,
      reloadInterval: DEFAULT_RELOAD_INTERVAL
    }),
    persist: {
      pick: ['filter', 'health', ...persistReloadIntervalProps()],
      key: `shards-${clusterUuid}`
    }
  })()
}
