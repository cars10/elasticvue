import { ElasticsearchCluster, ElasticsearchClusterCredentials, useConnectionStore } from '../../../store/connection.ts'
import ElasticsearchAdapter from '../../../services/ElasticsearchAdapter.ts'

export const useClusterHealth = () => {
  const connectionStore = useConnectionStore()

  const setupHealthLoading = () => {
    if (!connectionStore.activeCluster) return
    //setInterval(() => (checkHealth(connectionStore.activeCluster)), 30000)
  }
  setupHealthLoading()

  const checkAllClusters = () => (connectionStore.clusters.forEach(checkHealth))

  return {
    checkAllClusters
  }
}

export const checkHealth = async (cluster: ElasticsearchCluster) => {
  cluster.loading = true
  const adapter = new ElasticsearchAdapter(cluster as ElasticsearchClusterCredentials)

  try {
    const clusterHealthResponse: any = await adapter.clusterHealth()
    const clusterHealthBody = await clusterHealthResponse.json()
    cluster.status = clusterHealthBody.status

    delete cluster.loading
  } catch (e) {
    cluster.status = 'unknown'
    delete cluster.loading
  }
}

export const checkClusterHealth = async (credentials: ElasticsearchClusterCredentials): Promise<string> => {
  const adapter = new ElasticsearchAdapter(credentials)

  try {
    const clusterHealthResponse: any = await adapter.clusterHealth()
    const clusterHealthBody = await clusterHealthResponse.json()
    return clusterHealthBody.status
  } catch (e) {
    return 'error'
  }
}