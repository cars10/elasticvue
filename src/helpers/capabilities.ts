import { BuildFlavor, ElasticsearchCluster } from '../store/connection.ts'
import { versionAtLeast } from './minClusterVersion.ts'
import { clusterToolsCapabilities } from './clusterTools.ts'
import { elasticsearchCompatibleVersion, isOpensearch, isSupportedDistribution } from './clusterInfo.ts'

type CapabilityInput = Pick<ElasticsearchCluster, 'version' | 'distribution' | 'flavor'> | null | undefined

export const securityBasePath = (version?: string) =>
  !version || versionAtLeast(version, '6.6.0') ? '_security' : '_xpack/security'

export const buildCapabilities = (cluster: CapabilityInput) => {
  const version = cluster ? elasticsearchCompatibleVersion(cluster) : ''
  const major = parseInt(version, 10)
  const majorAtLeast = (required: number) => major >= required
  const atLeast = (required: string) => versionAtLeast(version, required)
  const elasticsearch = !!cluster && !isOpensearch(cluster.distribution)
  const serverless = cluster?.flavor === BuildFlavor.serverless

  return {
    version,
    elasticsearch,
    supported: !cluster || isSupportedDistribution(cluster.distribution),
    serverless,
    security: {
      available: elasticsearch && (!version || majorAtLeast(5)),
      users: !serverless,
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
      forcemerge: majorAtLeast(2) && !serverless,
      reindex: majorAtLeast(2),
      clone: majorAtLeast(7) && !serverless,
      openClose: !serverless,
      stats: !serverless,
      flush: !serverless,
      clearCache: !serverless,
      deleteByQuery: majorAtLeast(5)
    },
    nodes: {
      shards: majorAtLeast(8)
    },
    destructiveRequiresNameDefault: majorAtLeast(8),
    tools: clusterToolsCapabilities(version)
  }
}

export type ClusterCapabilities = ReturnType<typeof buildCapabilities>
