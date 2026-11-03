import { AuthType, ElasticsearchClusterAuth } from '../store/connection.ts'

const base64EncodeUtf8 = (str: string): string => {
  return btoa(unescape(encodeURIComponent(str)))
}

export const addTrailingSlash = (uri: string): string => {
  return uri.endsWith('/') ? uri : uri + '/'
}

export const clusterAuthHeader = (auth: ElasticsearchClusterAuth) => {
  switch (auth.authType) {
    case AuthType.basicAuth: {
      const { username, password } = auth.authData
      if (!username && !password) return undefined
      return 'Basic ' + base64EncodeUtf8(`${username}:${password}`)
    }
    case AuthType.apiKey:
      return auth.authData.apiKey ? `ApiKey ${auth.authData.apiKey}` : undefined
    default:
      return undefined
  }
}
