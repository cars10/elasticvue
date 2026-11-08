import { BuildFlavor, ElasticsearchCluster } from '../../../store/connection.ts'
import ElasticsearchAdapter from '../../../services/ElasticsearchAdapter.ts'
import { EsApiError } from '../../../services/errors.ts'
import { sessionSecrets } from '../../../helpers/auth.ts'
import { needsCredentials, useSessionCredentials, withSessionCredentials } from '../../../store/sessionCredentials.ts'
import { ClusterInfo, isSupportedDistribution, parseClusterInfo } from '../../../helpers/clusterInfo.ts'
import { ClusterFailure, describeFailure } from '../../../helpers/clusterFailure.ts'

export const fetchClusterStatus = async (adapter: ElasticsearchAdapter, info: ClusterInfo) => {
  if (info.flavor === BuildFlavor.serverless) return { status: 'green', health: null }

  try {
    const health = await adapter.clusterHealth()
    return { status: health?.status || '', health }
  } catch (e) {
    const apiError = e instanceof EsApiError && ![401, 403].includes(e.status)
    if (!apiError || isSupportedDistribution(info.distribution)) throw e
    return { status: '', health: null }
  }
}

export const checkHealth = async (cluster: ElasticsearchCluster) => {
  if (needsCredentials(cluster)) return { health: null, error: null }

  cluster.loading = true
  const adapter = new ElasticsearchAdapter(withSessionCredentials(cluster))
  let health: any = null
  let error: ClusterFailure | null = null
  let authenticated = false

  try {
    const pingBody = await adapter.ping()
    authenticated = true
    const info = parseClusterInfo(pingBody)
    const result = await fetchClusterStatus(adapter, info)
    health = result.health
    const status = result.status

    Object.assign(cluster, info, { status })
  } catch (e) {
    cluster.status = 'unknown'
    error = await describeFailure(e, cluster.uri)
    if (!authenticated && e instanceof EsApiError && [401, 403].includes(e.status) && sessionSecrets(cluster.auth)) {
      useSessionCredentials().remove(cluster.id)
    }
  }
  cluster.loading = false
  return { health, error }
}
