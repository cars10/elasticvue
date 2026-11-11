import { deleteDB } from 'idb'

export const CLUSTER_STORE_PREFIXES = [
  'rest',
  'search',
  'indices',
  'nodes',
  'shards',
  'shardRecovery',
  'snapshots',
  'snapshot-repositories',
  'users',
  'roles',
  'indexTemplates',
  'home',
  'tasks'
]

export const clusterDbName = (clusterId: string) => `elasticvue-${clusterId}`

export const clusterStorageKeys = (clusterId: string) => CLUSTER_STORE_PREFIXES.map((prefix) => `${prefix}-${clusterId}`)

export const removeClusterStorage = async (clusterId: string) => {
  try {
    clusterStorageKeys(clusterId).forEach((key) => localStorage.removeItem(key))
    await deleteDB(clusterDbName(clusterId))
  } catch (e) {
    console.error(e)
  }
}
