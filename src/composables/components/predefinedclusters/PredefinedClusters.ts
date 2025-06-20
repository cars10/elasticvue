import {
  BuildFlavor, ConnectionState,
  ElasticsearchCluster,
} from '../../../store/connection.ts'
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
}

export const importPredefinedClusters = async () => {
  const clusters = await loadPredefinedClusters()
  if (!clusters || clusters.length === 0) return

  const remainingClusters = loadRemainingClusters()
  importNewClusters(clusters, remainingClusters)
}

export const loadPredefinedClusters = async () => {
  try {
    const response = await fetch('/api/default_clusters.json')
    if (response.status !== 200) return

    const contentType = response.headers.get('Content-Type')
    if (!contentType?.includes('application/json')) return

    const predefinedClusters: PredefinedCluster[] = await response.json()

    return predefinedClusters.filter((cluster) => (cluster.uri && cluster.uri.length > 0))
  } catch (_e) {
    return
  }
}

export const importNewClusters = (clusters: PredefinedCluster[], remainingClusters: ElasticsearchCluster[]) => {
  const newClusters: ElasticsearchCluster[] = clusters.map((cluster) => {
    return {
      name: cluster.name || 'docker cluster',
      uri: cluster.uri,
      clusterName: '',
      version: '',
      majorVersion: '',
      distribution: '',
      uuid: '',
      status: '',
      loading: false,
      predefined: true,
      flavor: BuildFlavor.default,
      auth: buildAuth(cluster)
    }
  })

  const allClusters: ElasticsearchCluster[] = [...newClusters, ...remainingClusters]
  const state: ConnectionState = { clusters: allClusters, activeClusterIndex: 0 }
  localStorage.setItem('connection', JSON.stringify(state))
}

export const loadRemainingClusters = () => {
  const rawClusters = localStorage.getItem('connection')
  if (!rawClusters || rawClusters.length === 0) return []

  const connection = JSON.parse(rawClusters) as ConnectionState
  return connection.clusters.filter((cluster) => !cluster.predefined)
}
