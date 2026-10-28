import { defineStore } from 'pinia'
import { useConnectionStore } from './connection'
import { ReloadIntervalStorePartial, persistReloadIntervalProps } from './shared'

type HomeState = ReloadIntervalStorePartial

export const useHomeStore = () => {
  const connectionStore = useConnectionStore()
  const clusterUuid = connectionStore.activeCluster?.uuid || ''
  return defineStore(`home-${clusterUuid}`, {
    state: (): HomeState => ({
      reloadInterval: 10
    }),
    persist: {
      pick: [...persistReloadIntervalProps()],
      key: `home-${clusterUuid}`
    }
  })()
}
