import { BuildFlavor, ElasticsearchCluster } from '../../../store/connection.ts'
import ElasticsearchAdapter from '../../../services/ElasticsearchAdapter.ts'
import { EsApiError } from '../../../services/errors.ts'
import { sessionSecrets } from '../../../helpers/auth.ts'
import { needsCredentials, useSessionCredentials, withSessionCredentials } from '../../../store/sessionCredentials.ts'
import { DISTRIBUTIONS } from '../../../consts.ts'
import { ClusterFailure, describeFailure } from '../../../helpers/clusterFailure.ts'

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
    const flavor = pingBody.version.build_flavor || BuildFlavor.default

    let status
    if (flavor === BuildFlavor.serverless) {
      status = 'green'
    } else {
      health = await adapter.clusterHealth()
      status = health.status
    }

    cluster.status = status

    const version = pingBody.version.number

    cluster.clusterName = pingBody.cluster_name
    cluster.distribution = pingBody.version.distribution || DISTRIBUTIONS.elasticsearch
    cluster.version = version
    cluster.majorVersion = version[0]
    cluster.flavor = flavor
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
