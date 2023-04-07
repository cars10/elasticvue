import { defineStore } from 'pinia'

interface ElasticsearchCluster {
  name: string,
  username?: string,
  password?: string,
  uri: string,
  clusterName: string,
  version: string,
  majorVersion: number
  uuid: string,
  status: string
}

// @ts-ignore
export const useConnectionStore = defineStore('connection', {
  state: () => {
    return {
      clusters: [] as ElasticsearchCluster[],
      activeClusterIndex: null as number | null,
    }
  },
  getters: {
    activeCluster: state => {
      if (typeof state.activeClusterIndex !== 'number') return null
      return state.clusters[state.activeClusterIndex]
    }
  },
  actions: {
    addCluster (cluster: ElasticsearchCluster) {
      const len = this.clusters.push(Object.assign({}, cluster))
      this.activeClusterIndex = len - 1
      return this.activeClusterIndex
    },
    removeCluster (index: number) {
      this.clusters.splice(index, 1)
    }
  },
  persist: true
})
