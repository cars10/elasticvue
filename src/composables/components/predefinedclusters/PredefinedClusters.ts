import { BuildFlavor, ConnectionState, ElasticsearchCluster, SecretStorage } from '../../../store/connection.ts'
import { v4 as uuidv4 } from 'uuid'
import { buildAuth } from '../../../helpers/predefinedClusters/buildAuth.ts'

export type PredefinedCluster = {
  name?: string
  username?: string
  password?: string
  apiKey?: string
  uri: string
  S3accessKeyId?: string
  S3secretAccessKey?: string
  S3sessionToken?: string
  S3region?: string
  secretStorage?: SecretStorage
}

export const importPredefinedClusters = async () => {
  const clusters = await loadPredefinedClusters()
  if (!clusters || clusters.length === 0) return

  importNewClusters(clusters, loadRemainingClusters())
}

export const loadPredefinedClusters = async () => {
  try {
    const response = await fetch('/api/default_clusters.json')
    if (response.status !== 200) return

    const contentType = response.headers.get('Content-Type')
    if (!contentType?.includes('application/json')) return

    const predefinedClusters: PredefinedCluster[] = await response.json()

    return predefinedClusters.filter((cluster) => cluster.uri && cluster.uri.length > 0)
  } catch (_e) {
    return
  }
}

export const importNewClusters = (clusters: PredefinedCluster[], remainingClusters: ElasticsearchCluster[]) => {
  const previousState = loadConnectionState()
  const unmatched = previousState?.clusters.filter((cluster) => cluster.predefined) ?? []
  const takePrevious = (cluster: PredefinedCluster) => {
    let index = unmatched.findIndex((previous) => previous.uri === cluster.uri && previous.name === cluster.name)
    if (index < 0) index = unmatched.findIndex((previous) => previous.uri === cluster.uri)
    if (index < 0) return undefined
    return unmatched.splice(index, 1)[0]
  }

  const newClusters = clusters.map((cluster) => buildPredefinedCluster(cluster, takePrevious(cluster)))

  localStorage.setItem(
    'connection',
    JSON.stringify({
      clusters: [...newClusters, ...remainingClusters],
      activeClusterId: previousState?.activeClusterId ?? null
    } satisfies ConnectionState)
  )
}

export const loadRemainingClusters = () => {
  const connection = loadConnectionState()
  if (!connection) return []

  return connection.clusters.filter((cluster) => !cluster.predefined)
}

const buildPredefinedCluster = (cluster: PredefinedCluster, previous?: ElasticsearchCluster): ElasticsearchCluster => ({
  id: previous?.id || uuidv4(),
  name: cluster.name || previous?.name || 'docker cluster',
  uri: cluster.uri,
  clusterName: previous?.clusterName || '',
  version: previous?.version || '',
  majorVersion: previous?.majorVersion || '',
  distribution: previous?.distribution || '',
  status: previous?.status || '',
  loading: false,
  predefined: true,
  flavor: previous?.flavor || BuildFlavor.default,
  auth: buildAuth(cluster)
})

const loadConnectionState = (): ConnectionState | null => {
  const raw = localStorage.getItem('connection')
  if (!raw) return null

  try {
    return JSON.parse(raw) as ConnectionState
  } catch (_e) {
    return null
  }
}
