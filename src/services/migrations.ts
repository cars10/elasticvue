import { v4 as uuidv4 } from 'uuid'
import { deleteDB, openDB } from 'idb'
import { clusterDb } from '../db/Idb.ts'
import { DbTable } from '../db/indexeddb.ts'
import type { DbSchema } from '../db/types.ts'
import { AuthType, BuildFlavor, ElasticsearchCluster, ElasticsearchClusterAuth } from '../store/connection.ts'
import { allowedRowsPerPage, DEFAULT_SEARCH_QUERY } from '../consts.ts'
import { normalizeAuth, sessionSecrets, withoutSecrets } from '../helpers/auth.ts'

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

export const migrate = async () => {
  migrateConnection()
  migrateSearchStores()
  await migrateClusterStorage()
}

const CLUSTER_STORE_PREFIXES = [
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
  'home'
]
const CLUSTER_STORAGE_MIGRATED = 'clusterStorageMigrated'

type ClusterKeys = { id: string; uuid?: string }

export const clusterStorageKeyMoves = (clusters: ClusterKeys[], keys: string[]) =>
  clusters
    .filter((cluster) => cluster.uuid)
    .flatMap((cluster) => CLUSTER_STORE_PREFIXES.map((prefix) => [`${prefix}-${cluster.uuid}`, `${prefix}-${cluster.id}`]))
    .filter(([from, to]) => keys.includes(from) && !keys.includes(to))

const migrateClusterStorage = async () => {
  if (localStorage.getItem(CLUSTER_STORAGE_MIGRATED)) return

  let clusters: ClusterKeys[]
  try {
    clusters = JSON.parse(localStorage.getItem('connection') || '{}').clusters ?? []
  } catch (_e) {
    return
  }

  const moves = clusterStorageKeyMoves(clusters, Object.keys(localStorage))
  moves.forEach(([from, to]) => localStorage.setItem(to, localStorage.getItem(from) as string))
  new Set(moves.map(([from]) => from)).forEach((key) => localStorage.removeItem(key))

  try {
    const uuids = new Set(clusters.map((cluster) => cluster.uuid).filter((uuid): uuid is string => !!uuid))
    for (const uuid of uuids) {
      const ids = clusters.filter((cluster) => cluster.uuid === uuid).map((cluster) => cluster.id)
      await moveClusterDb(uuid, ids)
    }
    localStorage.setItem(CLUSTER_STORAGE_MIGRATED, 'true')
  } catch (e) {
    console.error(e)
  }
}

const moveClusterDb = async (uuid: string, ids: string[]) => {
  const name = `elasticvue-${uuid}`
  const legacy = await openDB(name)
  const tables = [...legacy.objectStoreNames] as (keyof DbSchema)[]
  const rows = await Promise.all(tables.map((table) => legacy.getAll(table)))
  legacy.close()

  for (const id of ids) {
    const db = clusterDb(id)
    for (const [i, table] of tables.entries()) {
      if (db[table]) await (db[table] as DbTable<any>).bulkInsert(rows[i])
    }
  }

  await deleteDB(name)
}

const migrateConnection = () => {
  const connectionData = localStorage.getItem('connection')
  if (!connectionData || connectionData.length === 0) return
  let connection

  try {
    connection = JSON.parse(connectionData)
  } catch (_e) {
    return
  }

  const migrated = migrateConnectionState(connection)
  if (migrated) localStorage.setItem('connection', JSON.stringify(migrated))
}

export const migrateConnectionState = (connection: any) => {
  if (!Array.isArray(connection?.clusters)) return null

  const clusters = connection.clusters
    .filter((cluster: unknown) => cluster && typeof cluster === 'object')
    .map((cluster: any) => {
      const withAuth = cluster.auth ? cluster : migrateAuthType([cluster])[0]
      const auth = normalizeAuth(withAuth.auth)
      return { ...withAuth, auth: sessionSecrets(auth) ? withoutSecrets(auth) : auth }
    })

  return migrateClusterIds({ ...connection, clusters })
}

export const migrateClusterIds = ({
  clusters,
  activeClusterIndex,
  activeClusterId,
  ...rest
}: {
  clusters: (Omit<ElasticsearchCluster, 'id'> & { id?: string })[]
  activeClusterIndex?: number | null
  activeClusterId?: string | null
}) => {
  const withIds = clusters.map((cluster) => ({ ...cluster, id: cluster.id || uuidv4() }))
  const legacyActive = typeof activeClusterIndex === 'number' ? withIds[activeClusterIndex]?.id : undefined

  return { ...rest, clusters: withIds, activeClusterId: activeClusterId ?? legacyActive ?? null }
}

export const migrateAuthType = (clusters: OldElasticsearchCluster[]): Omit<ElasticsearchCluster, 'id'>[] => {
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

type OldSearchState = Record<string, unknown> & {
  indices?: string | string[]
  searchQuery?: string
  searchQueryCollapsed?: boolean
}

const LEGACY_SEARCH_KEYS = ['indices', 'searchQuery', 'searchQueryCollapsed', 'filter', 'columns', 'visibleColumns']

export const migrateSearchState = (state: OldSearchState): Record<string, unknown> | null => {
  if (!('indices' in state) || 'targets' in state) return null

  const indices = state.indices
  const targets = (Array.isArray(indices) ? indices : String(indices ?? '').split(','))
    .map((index) => index.trim())
    .filter(Boolean)
  const customQuery = !!state.searchQueryCollapsed && !!state.searchQuery && state.searchQuery !== DEFAULT_SEARCH_QUERY

  const migrated = Object.fromEntries(Object.entries(state).filter(([key]) => !LEGACY_SEARCH_KEYS.includes(key)))
  const pagination = state.pagination as Record<string, unknown> | undefined
  return {
    ...migrated,
    ...(pagination && { pagination: { ...pagination, rowsPerPage: allowedRowsPerPage(pagination.rowsPerPage) } }),
    targets: targets.length > 0 ? targets : ['*'],
    mode: customQuery ? 'dsl' : 'query',
    dslBody: customQuery ? state.searchQuery : ''
  }
}

const migrateSearchStores = () => {
  Object.keys(localStorage)
    .filter((key) => key.startsWith('search-'))
    .forEach((key) => {
      try {
        const migrated = migrateSearchState(JSON.parse(localStorage.getItem(key) || '{}'))
        if (migrated) localStorage.setItem(key, JSON.stringify(migrated))
      } catch (_e) {
        localStorage.removeItem(key)
      }
    })
}
