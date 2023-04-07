import { defineStore, StoreDefinition } from 'pinia'

type ElasticsearchCluster = {
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
    removeCluster (index: number) {
      this.clusters.splice(index, 1)
    }
  },
  persist: true
})
