import { defineStore } from 'pinia'

export enum BuildFlavor {
  serverless = 'serverless',
  default = 'default'
}

export enum AuthType {
  none = 'none',
  basicAuth = 'basicAuth',
  apiKey = 'apiKey',
  awsIAM = 'awsIAM',
}

export type ElasticsearchCluster = {
  clusterName: string
  version: string
  majorVersion: string
  distribution: string
  uuid: string
  status: string
  loading?: boolean
  flavor: BuildFlavor
} & ElasticsearchClusterConnection

export type ElasticsearchClusterConnection = {
  name: string
  uri: string
  auth: ElasticsearchClusterAuth
}

export type ElasticsearchClusterAuth = {
  authType: AuthType.none,
  authData: undefined
} | {
  authType: AuthType.basicAuth,
  authData: { username: string, password: string }
} | {
  authType: AuthType.apiKey,
  authData: { apiKey: string }
} | {
  authType: AuthType.awsIAM,
  authData: { accessKeyId: string, secretAccessKey: string, sessionToken?: string, region: string }
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
    updateCluster ({ cluster, index }: { cluster: ElasticsearchClusterConnection, index: number }) {
      const old = this.clusters[index]
      this.clusters[index] = Object.assign({}, old, cluster)
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
