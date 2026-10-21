import { defineStore } from 'pinia'
import { DISTRIBUTIONS } from '../consts'
import { deserializeConnection, saveSessionPassword, serializeConnection } from '../services/SessionPasswords.ts'

export enum BuildFlavor {
  serverless = 'serverless',
  default = 'default'
}

export enum AuthType {
  none = 'none',
  basicAuth = 'basicAuth',
  apiKey = 'apiKey',
  awsIAM = 'awsIAM'
}

export type ElasticsearchCluster = {
  clusterName: string
  version: string
  majorVersion: string
  distribution: string
  uuid: string
  status: string
  loading?: boolean
  predefined?: boolean
  flavor: BuildFlavor
} & ElasticsearchClusterConnection

export type ElasticsearchClusterConnection = {
  name: string
  uri: string
  auth: ElasticsearchClusterAuth
}

export type ElasticsearchClusterAuth =
  | {
      authType: AuthType.none
      authData: object
    }
  | {
      authType: AuthType.basicAuth
      authData: { username: string; password: string; promptPassword?: boolean }
    }
  | {
      authType: AuthType.apiKey
      authData: { apiKey: string }
    }
  | {
      authType: AuthType.awsIAM
      authData: { accessKeyId: string; secretAccessKey: string; sessionToken?: string; region: string }
    }

export type ConnectionState = {
  clusters: ElasticsearchCluster[]
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
    activeCluster(): ElasticsearchCluster | null {
      if (typeof this.activeClusterIndex !== 'number') return null
      return this.clusters[this.activeClusterIndex]
    },
    serverless(): boolean {
      if (typeof this.activeClusterIndex !== 'number') return false
      return this.clusters[this.activeClusterIndex].flavor === BuildFlavor.serverless
    },
    elasticsearch(): boolean {
      if (typeof this.activeClusterIndex !== 'number') return false
      return this.clusters[this.activeClusterIndex].distribution !== DISTRIBUTIONS.opensearch
    }
  },
  actions: {
    addCluster(cluster: ElasticsearchCluster) {
      const len = this.clusters.push(Object.assign({}, cluster))
      this.activeClusterIndex = len - 1
      return this.activeClusterIndex
    },
    updateCluster({ cluster, index }: { cluster: ElasticsearchClusterConnection; index: number }) {
      const old = this.clusters[index]
      this.clusters[index] = cleanupClusterAuth(Object.assign({}, old, cluster))
    },
    setSessionCredentials({ index, username, password }: { index: number; username: string; password: string }) {
      const cluster = this.clusters[index]
      if (cluster?.auth.authType !== AuthType.basicAuth) return

      saveSessionPassword(cluster.uri, username, password)
      cluster.auth.authData.username = username
      cluster.auth.authData.password = password
    },
    removeCluster(index: number) {
      this.clusters.splice(index, 1)
    },
    checkAndSetActiveCluster() {
      if (this.activeClusterIndex === null || this.clusters.length === 0) return
      if (!this.clusters[this.activeClusterIndex]) this.activeClusterIndex = 0

      return this.clusters[this.activeClusterIndex]
    },
    validateAndSetClusterIndex(index: string) {
      if (index === null || this.clusters.length === 0) return

      let clusterIndex: number = 0
      try {
        clusterIndex = parseInt(index)
      } catch (_e) {}

      if (isNaN(clusterIndex) || clusterIndex + 1 > this.clusters.length || clusterIndex < 0) {
        this.activeClusterIndex = 0
        return false
      } else {
        this.activeClusterIndex = clusterIndex
        return true
      }
    },
    findClusterIndexByName(name: string) {
      if (!name || this.clusters.length === 0) return -1

      const normalizedName = name.trim().toLowerCase()
      if (!normalizedName) return -1

      return this.clusters.findIndex((cluster) => cluster.name.trim().toLowerCase() === normalizedName)
    },
    setActiveClusterByName(name: string) {
      const clusterIndex = this.findClusterIndexByName(name)
      if (clusterIndex < 0) return false

      this.activeClusterIndex = clusterIndex
      return true
    }
  },
  persist: {
    serializer: {
      serialize: (state) => serializeConnection(state as ConnectionState),
      deserialize: deserializeConnection
    }
  }
})

const cleanupClusterAuth = (cluster: ElasticsearchCluster): ElasticsearchCluster => {
  switch (cluster.auth.authType) {
    case AuthType.none:
      return {
        ...cluster,
        auth: {
          authType: AuthType.none,
          authData: {}
        }
      }
    case AuthType.basicAuth:
      return {
        ...cluster,
        auth: {
          authType: AuthType.basicAuth,
          authData: {
            username: cluster.auth.authData.username,
            password: cluster.auth.authData.password,
            promptPassword: cluster.auth.authData.promptPassword
          }
        }
      }
    case AuthType.apiKey:
      return {
        ...cluster,
        auth: {
          authType: AuthType.apiKey,
          authData: {
            apiKey: cluster.auth.authData.apiKey
          }
        }
      }
    case AuthType.awsIAM:
      return {
        ...cluster,
        auth: {
          authType: AuthType.awsIAM,
          authData: {
            accessKeyId: cluster.auth.authData.accessKeyId,
            secretAccessKey: cluster.auth.authData.secretAccessKey,
            sessionToken: cluster.auth.authData.sessionToken,
            region: cluster.auth.authData.region
          }
        }
      }
  }
}
