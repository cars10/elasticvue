import { AuthType, ElasticsearchClusterAuth, SecretStorage } from '../../store/connection.ts'
import { PredefinedCluster } from '../../composables/components/predefinedclusters/PredefinedClusters.ts'
import { AuthFields, SECRET_FIELDS, withoutSecrets } from '../auth.ts'

export const buildAuth = (cluster: PredefinedCluster): ElasticsearchClusterAuth => {
  const auth = configuredAuth(cluster)
  if (!auth) return { authType: AuthType.none, authData: {} }

  const askForSecrets = cluster.secretStorage === SecretStorage.session || !hasSecret(auth)
  return askForSecrets ? withoutSecrets({ ...auth, secretStorage: SecretStorage.session }) : auth
}

const configuredAuth = (cluster: PredefinedCluster): ElasticsearchClusterAuth | undefined => {
  const { username, password, apiKey, S3accessKeyId, S3secretAccessKey, S3sessionToken, S3region } = cluster

  if (username?.length) {
    return { authType: AuthType.basicAuth, authData: { username, password: password || '' } }
  }

  if (password?.length) return { authType: AuthType.apiKey, authData: { apiKey: password } }
  if (apiKey?.length) return { authType: AuthType.apiKey, authData: { apiKey } }

  if (S3accessKeyId?.length && S3region?.length) {
    return {
      authType: AuthType.awsIAM,
      authData: {
        accessKeyId: S3accessKeyId,
        secretAccessKey: S3secretAccessKey || '',
        region: S3region,
        ...(S3sessionToken?.length && { sessionToken: S3sessionToken })
      }
    }
  }

  if (cluster.secretStorage === SecretStorage.session) return { authType: AuthType.apiKey, authData: { apiKey: '' } }
}

const hasSecret = (auth: ElasticsearchClusterAuth) => {
  const [secret] = SECRET_FIELDS[auth.authType]
  return !!(auth.authData as AuthFields)[secret]
}
