import { defineStore } from 'pinia'
import { useConnectionStore } from './connection'

type RestState = {
  activeTabIndex: number
}

export const useRestStore = () => {
  const connectionStore = useConnectionStore()
  const clusterUuid = connectionStore.activeCluster?.uuid || ''
  return defineStore(`rest-${clusterUuid}`, {
    state: (): RestState => ({
      activeTabIndex: 0
    }),
    persist: {
      pick: ['activeTabIndex'],
      key: `rest-${clusterUuid}`
    }
  })()
}
