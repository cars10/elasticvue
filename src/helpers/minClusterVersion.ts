import { useConnectionStore } from '../store/connection.ts'

const getClusterMajorVersion = (): number | null => {
  const connectionStore = useConnectionStore()
  const majorVersion = connectionStore?.activeCluster?.majorVersion

  return majorVersion ? parseInt(majorVersion) : null
}

export const parseVersionParts = (version: string): number[] =>
  version
    .split('.')
    .map((part) => parseInt(part, 10))
    .map((part) => (Number.isFinite(part) ? part : 0))

/** Pure semver compare without reading the connection store */
export const versionAtLeast = (current: string | undefined | null, required: string): boolean => {
  if (!current) return false

  const currentParts = parseVersionParts(current)
  const requiredParts = parseVersionParts(required)
  const length = Math.max(currentParts.length, requiredParts.length)

  for (let i = 0; i < length; i++) {
    const a = currentParts[i] ?? 0
    const b = requiredParts[i] ?? 0
    if (a > b) return true
    if (a < b) return false
  }

  return true
}

const OPENSEARCH_ELASTICSEARCH_VERSION = '7.10.2'

export const elasticsearchCompatibleVersion = (version: string | undefined, isElasticsearch: boolean) =>
  isElasticsearch ? version || '' : OPENSEARCH_ELASTICSEARCH_VERSION

export const clusterVersionGte = (version: number): boolean => {
  const majorVersion = getClusterMajorVersion()
  return majorVersion !== null && majorVersion >= version
}

export const clusterVersionGt = (version: number): boolean => {
  const majorVersion = getClusterMajorVersion()
  return majorVersion !== null && majorVersion > version
}

/** Compare full cluster version strings, e.g. clusterVersionAtLeast('8.15.0') */
export const clusterVersionAtLeast = (required: string): boolean => {
  const connectionStore = useConnectionStore()
  return versionAtLeast(connectionStore.activeCluster?.version, required)
}
