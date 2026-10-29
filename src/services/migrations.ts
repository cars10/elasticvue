import { AuthType, BuildFlavor, ElasticsearchCluster, ElasticsearchClusterAuth } from '../store/connection.ts'
import { allowedRowsPerPage, DEFAULT_SEARCH_QUERY } from '../consts.ts'

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
  migrateConnection()
  migrateSearchStores()
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
