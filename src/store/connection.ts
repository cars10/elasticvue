import { defineStore } from 'pinia'

export enum BuildFlavor {
  serverless = 'serverless',
  default = 'default'
}

export type ElasticsearchCluster = {
  name: string
  clusterName: string
  version: string
  majorVersion: string
  distribution: string
  uuid: string
  status: string
  loading?: boolean
  flavor: BuildFlavor
} & ElasticsearchClusterCredentials

export type ElasticsearchClusterCredentials = {
  uri: string
  username: string
  password: string
  authType?: 'basic' | 'api' | 'aws-iam' | ''
  accessKeyId?: string
  secretAccessKey?: string
  sessionToken?: string
  region?: string
}

export type ConnectionState = {
  clusters: ElasticsearchCluster[],
  activeClusterIndex: number | null
}

export const useConnectionStore = defineStore('connection', {
  state: (): ConnectionState => {
    return {
      clusters: [],
      activeClusterIndex: null
    }
  },
  getters: {
    activeCluster (): ElasticsearchCluster | null {
      if (typeof this.activeClusterIndex !== 'number') return null
      return this.clusters[this.activeClusterIndex]
    },
    serverless (): boolean {
      if (typeof this.activeClusterIndex !== 'number') return false
      return this.clusters[this.activeClusterIndex].flavor === BuildFlavor.serverless
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
    validateAndSetClusterIndex (index: string) {
      if (index === null || this.clusters.length === 0) return

      let clusterIndex: number = 0
      try {
        clusterIndex = parseInt(index)
      } catch (_e) {
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
