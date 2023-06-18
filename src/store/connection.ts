import { defineStore, StoreDefinition } from 'pinia'

export type ElasticsearchCluster = {
  name: string,
  username: string,
  password: string,
  uri: string,
  clusterName: string,
  version: string,
  majorVersion: number
  uuid: string,
  status: string,
  loading?: boolean
}

type State = {
  clusters: ElasticsearchCluster[],
  activeClusterIndex: number | null
}

// @ts-ignore
export const useConnectionStore: StoreDefinition<'connection', State> = defineStore('connection', {
  state: (): State => {
    return {
      clusters: [],
      activeClusterIndex: null
    }
  },
  getters: {
    activeCluster (): ElasticsearchCluster | null {
      if (typeof this.activeClusterIndex !== 'number') return null
      return this.clusters[this.activeClusterIndex]
    }
  },
  actions: {
    addCluster (cluster: ElasticsearchCluster) {
      const len = this.clusters.push(Object.assign({}, cluster))
      this.activeClusterIndex = len - 1
      return this.activeClusterIndex
    },
    updateCluster ({ cluster, index }: { cluster: ElasticsearchCluster, index: number }) {
      this.clusters[index] = cluster
    },
    removeCluster (index: number) {
      this.clusters.splice(index, 1)
    },
    checkAndSetActiveCluster () {
      if (this.activeClusterIndex === null || this.clusters.length === 0) return
      if (!this.clusters[this.activeClusterIndex]) this.activeClusterIndex = 0

      return this.clusters[this.activeClusterIndex]
    },
    validateAndSetClusterIndex (index) {
      if (index === null || this.clusters.length === 0) return

      let clusterIndex: number = 0
      try {
        clusterIndex = parseInt(index)
      } catch (e) {
      }

      if (isNaN(clusterIndex) || (clusterIndex + 1) > this.clusters.length || clusterIndex < 0) {
        this.activeClusterIndex = 0
        return false
      } else {
        this.activeClusterIndex = clusterIndex
        return true
      }
    }
  },
  persist: true
})
