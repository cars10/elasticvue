import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'
import { normalizeAuth, pickSecrets, sessionSecrets, withoutSecrets } from '../helpers/auth.ts'
import { useSessionCredentials } from './sessionCredentials.ts'
import { removeClusterStorage } from '../helpers/clusterStorage.ts'

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

export enum SecretStorage {
  local = 'local',
  session = 'session'
}

export type ElasticsearchCluster = {
  id: string
  clusterName: string
  version: string
  majorVersion: string
  distribution: string
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

export type ElasticsearchClusterAuth = { secretStorage?: SecretStorage } & (
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
)

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
    clusterById(): (id: string | null) => ElasticsearchCluster | undefined {
      return (id) => this.clusters.find((cluster) => cluster.id === id)
    },
    activeCluster(): ElasticsearchCluster | null {
      return this.clusterById(this.activeClusterId) ?? null
    }
  },
  actions: {
    addCluster(cluster: Omit<ElasticsearchCluster, 'id'>) {
      const id = uuidv4()
      this.clusters.push({ ...cluster, id, auth: storeAuth(id, normalizeAuth(cluster.auth)) })
      this.activeClusterId = id
      return id
    },
    updateCluster({ cluster, id }: { cluster: ElasticsearchClusterConnection; id: string }) {
      const index = this.clusters.findIndex((c) => c.id === id)
      if (index < 0) return

      const { name, uri } = cluster
      this.clusters[index] = { ...this.clusters[index], name, uri, auth: storeAuth(id, normalizeAuth(cluster.auth)) }
    },
    removeCluster(id: string) {
      this.clusters = this.clusters.filter((cluster) => cluster.id !== id)
      useSessionCredentials().remove(id)
      removeClusterStorage(id)
    },
    checkAndSetActiveCluster() {
      if (this.clusters.length === 0) return
      if (!this.activeCluster) this.activeClusterId = this.clusters[0].id

      return this.activeCluster
    },
    setActiveCluster(id: string) {
      if (!this.clusterById(id)) return false

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
  persist: {
    serializer: {
      serialize: (state) => JSON.stringify(withoutSessionSecrets(state as ConnectionState)),
      deserialize: JSON.parse
    }
  }
})

const storeAuth = (id: string, auth: ElasticsearchClusterAuth) => {
  const credentials = useSessionCredentials()
  if (!sessionSecrets(auth)) {
    credentials.remove(id)
    return auth
  }

  const secrets = pickSecrets(auth)
  if (Object.keys(secrets).length > 0) credentials.set(id, secrets)
  else credentials.remove(id)
  return withoutSecrets(auth)
}

const withoutSessionSecrets = (state: ConnectionState): ConnectionState => ({
  ...state,
  clusters: state.clusters.map((cluster) =>
    sessionSecrets(cluster.auth) ? { ...cluster, auth: withoutSecrets(cluster.auth) } : cluster
  )
})
