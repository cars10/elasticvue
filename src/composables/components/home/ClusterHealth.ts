import { ElasticsearchCluster, useConnectionStore } from '../../../store/connection.ts'
import ElasticsearchAdapter from '../../../services/ElasticsearchAdapter.ts'

export const useClusterHealth = () => {
  const connectionStore = useConnectionStore()

  const setupHealthLoading = () => {
    if (!connectionStore.activeCluster) return
    checkHealth(connectionStore.activeCluster)
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
  const adapter = new ElasticsearchAdapter(cluster)

  try {
    const clusterHealthResponse: any = await adapter.clusterHealth()
    const clusterHealthBody = await clusterHealthResponse.json()
    cluster.status = clusterHealthBody.status

    const pingResponse: any = await adapter.ping()
    const pingBody = await pingResponse.json()
    const version = pingBody.version.number

    cluster.clusterName = pingBody.cluster_name
    cluster.version = version
    cluster.majorVersion = version[0]
    cluster.uuid = pingBody.cluster_uuid

    delete cluster.loading
  } catch (e) {
    cluster.status = 'unknown'
    delete cluster.loading
  }
}