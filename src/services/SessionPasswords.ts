import { AuthType, ConnectionState, ElasticsearchClusterConnection } from '../store/connection.ts'

// Passwords of clusters with "promptPassword" are never written to localStorage.
// They are kept in sessionStorage instead: they survive the page reloads elasticvue does when switching clusters,
// and are gone once the tab or window is closed.
const SESSION_STORAGE_KEY = 'sessionPasswords'

type SessionPasswords = Record<string, string>

export const needsPassword = (cluster: ElasticsearchClusterConnection) =>
  cluster.auth.authType === AuthType.basicAuth && !!cluster.auth.authData.promptPassword && !cluster.auth.authData.password

// Same uri and username means same credentials, so clusters can be renamed or reordered without losing the password.
const passwordKey = (uri: string, username: string) => `${username}@${uri}`

const loadSessionPasswords = (): SessionPasswords => {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY) || '{}')
  } catch (_e) {
    return {}
  }
}

export const saveSessionPassword = (uri: string, username: string, password: string) => {
  const passwords = loadSessionPasswords()
  passwords[passwordKey(uri, username)] = password
  sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(passwords))
}

export const serializeConnection = (state: ConnectionState): string => {
  const clusters = state.clusters.map((cluster) => {
    if (cluster.auth.authType !== AuthType.basicAuth || !cluster.auth.authData.promptPassword) return cluster

    const { username, password } = cluster.auth.authData
    if (password) saveSessionPassword(cluster.uri, username, password)

    return { ...cluster, auth: { ...cluster.auth, authData: { ...cluster.auth.authData, password: '' } } }
  })

  return JSON.stringify({ ...state, clusters })
}

export const deserializeConnection = (data: string): ConnectionState => {
  const state: ConnectionState = JSON.parse(data)
  if (!Array.isArray(state.clusters)) return state

  const passwords = loadSessionPasswords()
  state.clusters.forEach((cluster) => {
    if (cluster.auth?.authType !== AuthType.basicAuth || !cluster.auth.authData.promptPassword) return

    cluster.auth.authData.password = passwords[passwordKey(cluster.uri, cluster.auth.authData.username)] || ''
  })

  return state
}
