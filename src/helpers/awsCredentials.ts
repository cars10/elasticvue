import { invoke } from '@tauri-apps/api/core'
import { buildConfig } from '../buildConfig.ts'
import { AuthType, type ElasticsearchClusterConnection, getAwsCredentialType } from '../store/connection.ts'

type ResolvedAwsCredentials = {
  accessKeyId: string
  secretAccessKey: string
  sessionToken?: string
  region: string
}

/**
 * Resolves AWS profile to explicit credentials via Tauri (desktop only).
 * Returns the connection unchanged for non-AWS or basic credentials.
 */
export async function resolveConnectionForAdapter(
  connection: ElasticsearchClusterConnection
): Promise<ElasticsearchClusterConnection> {
  if (connection.auth.authType !== AuthType.awsIAM) {
    return connection
  }
  const credentialType = getAwsCredentialType(connection.auth)
  if (credentialType !== 'profile') {
    return connection
  }

  const data = connection.auth.authData
  if (data.awsCredentialType !== 'profile') {
    return connection
  }

  const { profileName, region: profileRegion } = data

  if (!buildConfig.tauri) {
    return Promise.reject(new Error('AWS Profile is only available in the desktop app.'))
  }

  let result: ResolvedAwsCredentials
  try {
    result = await invoke<ResolvedAwsCredentials>('resolve_aws_profile', {
      // Tauri maps Rust `profile_name` to JS `profileName` by default
      profileName: profileName || 'default',
      region: profileRegion || undefined
    })
  } catch (err: unknown) {
    const msg = typeof err === 'string' ? err : (err as Error)?.message ?? 'Failed to resolve AWS profile'
    return Promise.reject(new Error(msg))
  }

  return {
    ...connection,
    auth: {
      authType: AuthType.awsIAM,
      authData: {
        awsCredentialType: 'basic' as const,
        accessKeyId: result.accessKeyId,
        secretAccessKey: result.secretAccessKey,
        sessionToken: result.sessionToken,
        region: result.region
      }
    }
  }
}
