import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'
import { DISTRIBUTIONS } from '../consts'

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
  id: string
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
      authData: { username: string; password: string }
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
  activeClusterId: string | null
}

export const useConnectionStore = defineStore('connection', {
  state: (): ConnectionState => {
    return {
      clusters: [],
      activeClusterId: null
    }
  },
  getters: {
    activeCluster(): ElasticsearchCluster | null {
      return this.clusters.find((cluster) => cluster.id === this.activeClusterId) ?? null
    },
    serverless(): boolean {
      return this.activeCluster?.flavor === BuildFlavor.serverless
    },
    elasticsearch(): boolean {
      if (!this.activeCluster) return false
      return this.activeCluster.distribution !== DISTRIBUTIONS.opensearch
    }
  },
  actions: {
    addCluster(cluster: Omit<ElasticsearchCluster, 'id'>) {
      const id = uuidv4()
      this.clusters.push({ ...cluster, id })
      this.activeClusterId = id
      return id
    },
    updateCluster({ cluster, id }: { cluster: ElasticsearchClusterConnection; id: string }) {
      const index = this.clusters.findIndex((c) => c.id === id)
      if (index < 0) return
      this.clusters[index] = cleanupClusterAuth(Object.assign({}, this.clusters[index], cluster))
    },
    removeCluster(id: string) {
      this.clusters = this.clusters.filter((cluster) => cluster.id !== id)
    },
    checkAndSetActiveCluster() {
      if (this.clusters.length === 0) return
      if (!this.activeCluster) this.activeClusterId = this.clusters[0].id

      return this.activeCluster
    },
    setActiveCluster(id: string) {
      if (!this.clusters.some((cluster) => cluster.id === id)) return false

      this.activeClusterId = id
      return true
    },
    setActiveClusterByName(name: string) {
      const normalizedName = name?.trim().toLowerCase()
      if (!normalizedName) return false

      const cluster = this.clusters.find((c) => c.name.trim().toLowerCase() === normalizedName)
      if (!cluster) return false

      this.activeClusterId = cluster.id
      return true
    }
  },
  persist: true
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
            password: cluster.auth.authData.password
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
