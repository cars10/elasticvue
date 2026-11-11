import { BuildFlavor, ElasticsearchCluster } from '../store/connection.ts'
import { versionAtLeast } from './minClusterVersion.ts'
import { elasticsearchCompatibleVersion, isOpensearch, isSupportedDistribution } from './clusterInfo.ts'

type CapabilityInput = Pick<ElasticsearchCluster, 'version' | 'distribution' | 'flavor'> | null | undefined

export type SqlApi = { path: string; format: string; params?: Record<string, unknown> }

export const securityBasePath = (version?: string) =>
  !version || versionAtLeast(version, '6.6.0') ? '_security' : '_xpack/security'

const sqlApi = (version: string, elasticsearch: boolean): SqlApi | null => {
  if (!elasticsearch) return { path: '_plugins/_sql', format: 'jdbc' }

  const lenient = versionAtLeast(version, '6.8.0') ? { params: { field_multi_value_leniency: true } } : {}
  if (versionAtLeast(version, '7.0.0')) return { path: '_sql', format: 'json', ...lenient }
  if (versionAtLeast(version, '6.3.0')) return { path: '_xpack/sql', format: 'json', ...lenient }
  return null
}

const esqlApi = (version: string, elasticsearch: boolean): SqlApi | null =>
  elasticsearch && versionAtLeast(version, '8.11.0') ? { path: '_query', format: 'json' } : null

export const buildCapabilities = (cluster: CapabilityInput) => {
  const version = cluster ? elasticsearchCompatibleVersion(cluster) : ''
  const major = parseInt(version, 10)
  const majorAtLeast = (required: number) => major >= required
  const atLeast = (required: string) => versionAtLeast(version, required)
  const atLeastOrUnknown = (required: string) => !version || atLeast(required)
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
      deleteByQuery: majorAtLeast(5),
      composableTemplates: atLeastOrUnknown('7.8.0')
    },
    nodes: {
      shards: majorAtLeast(8)
    },
    search: {
      boolFilter: majorAtLeast(2),
      terminateAfter: majorAtLeast(2),
      stringFieldType: !majorAtLeast(5),
      typeColumn: majorAtLeast(1) && !majorAtLeast(7),
      sortableId: majorAtLeast(1) && !majorAtLeast(8) && major !== 5,
      trackTotalHits: majorAtLeast(7),
      unmappedType: atLeast('1.4.0'),
      fieldCaps: atLeast('5.0.0'),
      fieldCapsUnmapped: atLeast('7.2.0'),
      fixedInterval: atLeast('7.2.0'),
      resolveIndex: atLeast('7.9.0'),
      sql: sqlApi(version, elasticsearch),
      esql: esqlApi(version, elasticsearch)
    },
    tasks: atLeast('2.3.0') && !serverless,
    destructiveRequiresNameDefault: majorAtLeast(8),
    tools: {
      allocationExplain: atLeastOrUnknown('5.0.0'),
      retryFailed: atLeastOrUnknown('5.0.0'),
      settingsReset: atLeastOrUnknown('5.0.0'),
      floodStage: atLeastOrUnknown('6.0.0'),
      clusterReadOnlyAllowDelete: atLeastOrUnknown('6.0.0'),
      votingExclusions: atLeastOrUnknown('7.8.0'),
      dataStreams: atLeastOrUnknown('7.9.0'),
      maxHeadroom: atLeastOrUnknown('8.5.0')
    }
  }
}

export type ClusterCapabilities = ReturnType<typeof buildCapabilities>
export type SearchCapabilities = ClusterCapabilities['search']
