import { useConnectionStore } from '../store/connection'
import ElasticsearchAdapter from '../services/ElasticsearchAdapter'

export const useClusterHealth = () => {
  const connectionStore = useConnectionStore()

  const setupHealthLoading = () => {
    checkHealth(connectionStore.activeCluster)
    setInterval(() => (checkHealth(connectionStore.activeCluster)), 30000)
  }
  setupHealthLoading()

  const checkAllClusters = () => (connectionStore.clusters.forEach(checkHealth))

  return {
    checkAllClusters
  }
}

export const checkHealth = async cluster => {
  cluster.loading = true
  const adapter = new ElasticsearchAdapter(cluster)

  try {
    const clusterHealthResponse = await adapter.clusterHealth()
    const clusterHealthBody = await clusterHealthResponse.json()
    cluster.status = clusterHealthBody.status

    const pingResponse = await adapter.ping()
    const pingBody = await pingResponse.json()
    const version = pingBody.version.number

    cluster.version = version
    cluster.majorVersion = version[0]

    delete cluster.loading
  } catch (e) {
    cluster.status = 'unknown'
    delete cluster.loading
  }
}