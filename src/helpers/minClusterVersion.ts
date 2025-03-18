import { useConnectionStore } from '../store/connection.ts'

const getClusterMajorVersion = (): number | null => {
  const connectionStore = useConnectionStore()
  const majorVersion = connectionStore?.activeCluster?.majorVersion

  return majorVersion ? parseInt(majorVersion) : null
}

export const clusterVersionGte = (version: number): boolean => {
  const majorVersion = getClusterMajorVersion()
  return majorVersion !== null && majorVersion >= version
}

export const clusterVersionGt = (version: number): boolean => {
  const majorVersion = getClusterMajorVersion()
  return majorVersion !== null && majorVersion > version
}
