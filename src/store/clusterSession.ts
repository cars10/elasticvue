import { defineStore } from 'pinia'
import { markRaw } from 'vue'
import ElasticsearchAdapter from '../services/ElasticsearchAdapter.ts'
import { ElasticsearchCluster, useConnectionStore } from './connection.ts'
import { checkHealth } from '../composables/components/home/ClusterHealth.ts'
import { ClusterFailure } from '../helpers/clusterFailure.ts'
import { buildCapabilities, ClusterCapabilities } from '../helpers/capabilities.ts'
import { needsCredentials, withSessionCredentials } from './sessionCredentials.ts'

const HEALTH_INTERVAL = 30000
let connections = 0

type ClusterSessionState = {
  clusterId: string | null
  connectionId: number
  adapter: ElasticsearchAdapter | null
  connectState: 'idle' | 'connecting' | 'credentials' | 'ready' | 'error'
  error: ClusterFailure | null
  healthTimer: number | undefined
}

export const useClusterSession = defineStore('clusterSession', {
  state: (): ClusterSessionState => ({
    clusterId: null,
    connectionId: 0,
    adapter: null,
    connectState: 'idle',
    error: null,
    healthTimer: undefined
  }),
  getters: {
    capabilities(): ClusterCapabilities {
      return buildCapabilities(useConnectionStore().activeCluster)
    }
  },
  actions: {
    async connect(clusterId: string) {
      if (this.clusterId === clusterId && this.connectState !== 'error') return

      const cluster = useConnectionStore().clusterById(clusterId)
      this.disconnect()
      if (!cluster) return

      this.clusterId = clusterId
      this.connectionId = ++connections
      if (needsCredentials(cluster)) {
        this.connectState = 'credentials'
        return
      }

      const adapter = markRaw(new ElasticsearchAdapter(withSessionCredentials(cluster)))
      this.adapter = adapter
      this.connectState = 'connecting'

      await this.checkHealth(cluster, adapter)
      if (this.adapter !== adapter) return

      this.healthTimer = window.setInterval(() => this.checkHealth(cluster, adapter), HEALTH_INTERVAL)
    },
    async checkHealth(cluster: ElasticsearchCluster, adapter: ElasticsearchAdapter) {
      const { error } = await checkHealth(cluster)
      if (this.adapter !== adapter) return

      this.error = error

      if (needsCredentials(cluster)) {
        this.disconnect()
        this.clusterId = cluster.id
        this.connectState = 'credentials'
      } else {
        this.connectState = cluster.status === 'unknown' ? 'error' : 'ready'
      }
    },
    reconnect() {
      const clusterId = this.clusterId
      this.disconnect()
      if (clusterId) return this.connect(clusterId)
    },
    disconnect() {
      window.clearInterval(this.healthTimer)
      this.$reset()
    }
  }
})
