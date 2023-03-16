import { defineStore } from 'pinia'

export const useConnectionStore = defineStore('connection', {
  state: () => {
    return {
      clusters: [],
      activeClusterIndex: null,
    }
  },
  getters: {
    activeCluster: state => {
      if (typeof state.activeClusterIndex !== 'number') return null
      return state.clusters[state.activeClusterIndex]
    }
  },
  actions: {
    addCluster (cluster) {
      const len = this.clusters.push(Object.assign({}, cluster))
      this.activeClusterIndex = len - 1
      return this.activeClusterIndex
    },
    removeCluster (index) {
      this.clusters.splice(index, 1)
    }
  },
  persist: true
})
