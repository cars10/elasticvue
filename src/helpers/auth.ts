import { AuthType, ElasticsearchClusterAuth, SecretStorage } from '../store/connection.ts'

export type AuthFields = Record<string, string>

export const SECRET_FIELDS: Record<`${AuthType}`, string[]> = {
  none: [],
  basicAuth: ['password'],
  apiKey: ['apiKey'],
  awsIAM: ['secretAccessKey', 'sessionToken']
}

export const IDENTITY_FIELDS: Record<`${AuthType}`, string[]> = {
  none: [],
  basicAuth: ['username'],
  apiKey: [],
  awsIAM: ['accessKeyId']
}

const str = (value: unknown) => (typeof value === 'string' ? value : '')

export const normalizeAuth = (raw: unknown): ElasticsearchClusterAuth => {
  const auth = raw && typeof raw === 'object' ? (raw as Record<string, any>) : {}
  const data = auth.authData && typeof auth.authData === 'object' ? auth.authData : {}
  const storage = auth.secretStorage === SecretStorage.session ? { secretStorage: SecretStorage.session } : {}

  switch (auth.authType) {
    case AuthType.basicAuth:
      if (!str(data.username) && str(data.password)) {
        return { authType: AuthType.apiKey, authData: { apiKey: str(data.password) }, ...storage }
      }
      return {
        authType: AuthType.basicAuth,
        authData: { username: str(data.username), password: str(data.password) },
        ...storage
      }
    case AuthType.apiKey:
      return { authType: AuthType.apiKey, authData: { apiKey: str(data.apiKey) }, ...storage }
    case AuthType.awsIAM:
      return {
        authType: AuthType.awsIAM,
        authData: {
          accessKeyId: str(data.accessKeyId),
          secretAccessKey: str(data.secretAccessKey),
          region: str(data.region),
          ...(str(data.sessionToken) && { sessionToken: str(data.sessionToken) })
        },
        ...storage
      }
    default:
      return { authType: AuthType.none, authData: {} }
  }
}

export const sessionSecrets = (auth: ElasticsearchClusterAuth) => auth.secretStorage === SecretStorage.session

export const pickFields = (auth: ElasticsearchClusterAuth, fields: string[]): AuthFields => {
  const data = auth.authData as AuthFields
  return Object.fromEntries(fields.filter((field) => data[field]).map((field) => [field, data[field]]))
}

export const pickSecrets = (auth: ElasticsearchClusterAuth) => pickFields(auth, SECRET_FIELDS[auth.authType])

export const withoutSecrets = (auth: ElasticsearchClusterAuth): ElasticsearchClusterAuth => {
  const authData = { ...(auth.authData as AuthFields) }
  SECRET_FIELDS[auth.authType].forEach((field) => {
    if (field in authData) authData[field] = ''
  })
  return normalizeAuth({ ...auth, authData })
}

export const withFields = (auth: ElasticsearchClusterAuth, fields: AuthFields): ElasticsearchClusterAuth =>
  normalizeAuth({ ...auth, authData: { ...auth.authData, ...fields } })
