import {
  BuildFlavor,
  ElasticsearchCluster, ElasticsearchClusterConnection,
  useConnectionStore
} from '../../../store/connection.ts'
import ElasticsearchAdapter from '../../../services/ElasticsearchAdapter.ts'
import { clusterUuid } from '../../ClusterConnection.ts'
import { DISTRIBUTIONS } from '../../../consts.ts'

export const useClusterHealth = () => {
  const connectionStore = useConnectionStore()

  const setupHealthLoading = () => {
    if (!connectionStore.activeCluster) return
    checkHealth(connectionStore.activeCluster)
    window.setInterval(() => {
      if (connectionStore.activeCluster) checkHealth(connectionStore.activeCluster)
    }, 30000)
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
    const pingResponse: any = await adapter.ping()
    const pingBody = await pingResponse.json()
    const flavor = pingBody.version.build_flavor || BuildFlavor.default

    let status
    if (flavor === BuildFlavor.serverless) {
      status = 'green'
    } else {
      const clusterHealthResponse: any = await adapter.clusterHealth()
      const clusterHealthBody = await clusterHealthResponse.json()
      status = clusterHealthBody.status
    }

    cluster.status = status

    const version = pingBody.version.number

    cluster.clusterName = pingBody.cluster_name
    cluster.distribution = pingBody.version.distribution || DISTRIBUTIONS.elasticsearch
    cluster.version = version
    cluster.majorVersion = version[0]
    cluster.flavor = flavor
    if (!cluster.uuid || cluster.uuid.length === 0) cluster.uuid = clusterUuid(pingBody)

  } catch (_e) {
    cluster.status = 'unknown'
  }
  cluster.loading = false
}

export const checkClusterHealth = async (credentials: ElasticsearchClusterConnection): Promise<string> => {
  const adapter = new ElasticsearchAdapter(credentials)

  try {
    const clusterHealthResponse: any = await adapter.clusterHealth()
    const clusterHealthBody = await clusterHealthResponse.json()
    return clusterHealthBody.status
  } catch (_e) {
    return 'unknown'
  }
}