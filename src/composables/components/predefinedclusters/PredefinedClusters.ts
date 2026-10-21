import { BuildFlavor, ConnectionState, ElasticsearchCluster } from '../../../store/connection.ts'
import { buildAuth } from '../../../helpers/predefinedClusters/buildAuth.ts'

export type PredefinedCluster = {
  name?: string
  username?: string
  password?: string
  promptPassword?: boolean
  apiKey?: string
  uri: string
  S3accessKeyId?: string
  S3secretAccessKey?: string
  S3sessionToken?: string
  S3region?: string
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
  const previousByUri = new Map(
    (previousState?.clusters.filter((cluster) => cluster.predefined) ?? []).map((cluster) => [cluster.uri, cluster])
  )

  const newClusters = clusters.map((cluster) => buildPredefinedCluster(cluster, previousByUri.get(cluster.uri)))

  localStorage.setItem(
    'connection',
    JSON.stringify({
      clusters: [...newClusters, ...remainingClusters],
      activeClusterIndex: previousState?.activeClusterIndex ?? 0
    } satisfies ConnectionState)
  )
}

export const loadRemainingClusters = () => {
  const connection = loadConnectionState()
  if (!connection) return []

  return connection.clusters.filter((cluster) => !cluster.predefined)
}

const buildPredefinedCluster = (
  cluster: PredefinedCluster,
  previous?: ElasticsearchCluster
): ElasticsearchCluster => ({
  name: cluster.name || previous?.name || 'docker cluster',
  uri: cluster.uri,
  clusterName: previous?.clusterName || '',
  version: previous?.version || '',
  majorVersion: previous?.majorVersion || '',
  distribution: previous?.distribution || '',
  uuid: previous?.uuid || '',
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
