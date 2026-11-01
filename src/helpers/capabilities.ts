import { BuildFlavor, ElasticsearchCluster } from '../store/connection.ts'
import { DISTRIBUTIONS } from '../consts.ts'
import { versionAtLeast } from './minClusterVersion.ts'
import { clusterToolsCapabilities } from './clusterTools.ts'

type CapabilityInput = Pick<ElasticsearchCluster, 'version' | 'distribution' | 'flavor'> | null | undefined

export const securityBasePath = (version?: string) =>
  !version || versionAtLeast(version, '6.6.0') ? '_security' : '_xpack/security'

export const buildCapabilities = (cluster: CapabilityInput) => {
  const version = cluster?.version || ''
  const major = parseInt(version, 10)
  const majorAtLeast = (required: number) => major >= required
  const atLeast = (required: string) => versionAtLeast(version, required)
  const elasticsearch = !!cluster && cluster.distribution !== DISTRIBUTIONS.opensearch

  return {
    elasticsearch,
    serverless: cluster?.flavor === BuildFlavor.serverless,
    security: {
      available: elasticsearch && (!version || majorAtLeast(5)),
      userEnabledInBody: majorAtLeast(6),
      roleApplications: atLeast('6.4.0'),
      allowRestrictedIndices: atLeast('6.7.0'),
      roleDescription: atLeast('8.15.0')
    },
    snapshots: {
      slm: elasticsearch && atLeast('7.4.0'),
      repositoryVerify: atLeast('1.4.0')
    },
    indices: {
      expandWildcardsAll: majorAtLeast(8),
      mappingTypes: !majorAtLeast(7),
      forcemerge: majorAtLeast(2),
      reindex: majorAtLeast(2),
      clone: majorAtLeast(7),
      deleteByQuery: majorAtLeast(5)
    },
    nodes: {
      shards: majorAtLeast(8)
    },
    destructiveRequiresNameDefault: !elasticsearch || majorAtLeast(8),
    tools: clusterToolsCapabilities(version, !elasticsearch)
  }
}

export type ClusterCapabilities = ReturnType<typeof buildCapabilities>
