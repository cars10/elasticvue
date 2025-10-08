import { AuthType, BuildFlavor, ElasticsearchCluster, ElasticsearchClusterAuth } from '../store/connection.ts'

export type OldElasticsearchCluster = {
  name: string
  clusterName: string
  version: string
  majorVersion: string
  distribution: string
  uuid: string
  status: string
  loading?: boolean
  flavor: BuildFlavor
  username: string
  password: string
  uri: string
}

export const migrate = () => {
  const connectionData = localStorage.getItem('connection')
  if (!connectionData || connectionData.length === 0) return
  let connection

  try {
    connection = JSON.parse(connectionData)
  } catch (_e) {
    return
  }

  if (connection.clusters.length === 0) return
  if (connection.clusters[0].auth) return

  connection.clusters = migrateAuthType(connection.clusters as unknown as OldElasticsearchCluster[])

  localStorage.setItem('connection', JSON.stringify(connection))
}

export const migrateAuthType = (clusters: OldElasticsearchCluster[]): ElasticsearchCluster[] => {
  return clusters.map((cluster) => {
    let authType: AuthType
    let authData: unknown

    const { username, password, ...rest } = cluster

    if (username?.length > 0) {
      authType = AuthType.basicAuth
      authData = { username, password }
    } else if (username?.length === 0 && password?.length > 0) {
      authType = AuthType.apiKey
      authData = { apiKey: password }
    } else {
      authType = AuthType.none
      authData = {}
    }

    return {
      ...rest,
      auth: {
        authType,
        authData
      } as ElasticsearchClusterAuth
    }
  })
}
