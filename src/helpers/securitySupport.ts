import { clusterVersionAtLeast, clusterVersionGte, versionAtLeast } from './minClusterVersion.ts'
import { useConnectionStore } from '../store/connection.ts'

/**
 * Native Elasticsearch user/role management (`/_security` / `/_xpack/security`).
 * Not available on OpenSearch. Requires Elasticsearch 5.0+.
 */
export const supportsNativeSecurityApi = () => {
  const connectionStore = useConnectionStore()
  if (!connectionStore.elasticsearch) return false

  const majorVersion = connectionStore.activeCluster?.majorVersion
  if (!majorVersion) return true
  return parseInt(majorVersion) >= 5
}

/** Prefer live cluster version; default to short `/_security` when unknown */
export const currentSecurityApiBasePath = () => {
  const connectionStore = useConnectionStore()
  const version = connectionStore.activeCluster?.version
  if (!version) return '_security'
  return versionAtLeast(version, '6.6.0') ? '_security' : '_xpack/security'
}

export const securityApiBasePath = (clusterVersion?: string | null) => {
  if (!clusterVersion) return '_security'
  return versionAtLeast(clusterVersion, '6.6.0') ? '_security' : '_xpack/security'
}

/** `enabled` in PUT user body from Elasticsearch 6.0 */
export const supportsUserEnabledInBody = () => clusterVersionGte(6)

/** Role `applications` privileges from Elasticsearch 6.4.0 */
export const supportsRoleApplications = () => clusterVersionAtLeast('6.4.0')

/** `indices.allow_restricted_indices` from Elasticsearch 6.7.0 */
export const supportsAllowRestrictedIndices = () => clusterVersionAtLeast('6.7.0')

/** Role `description` from Elasticsearch 8.15.0 */
export const supportsRoleDescription = () => clusterVersionAtLeast('8.15.0')
