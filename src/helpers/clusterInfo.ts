import { BuildFlavor } from '../store/connection.ts'
import {
  DISTRIBUTIONS,
  LATEST_ELASTICSEARCH_VERSION,
  OPENSEARCH_ELASTICSEARCH_VERSION,
  SUPPORTED_MAJOR_VERSIONS,
  SUPPORTED_OPENSEARCH_MAJOR_VERSIONS
} from '../consts.ts'

export const UNKNOWN_DISTRIBUTION = 'unknown'

export type ClusterInfo = {
  clusterName: string
  version: string
  majorVersion: string
  distribution: string
  flavor: BuildFlavor
}

type ClusterIdentity = { distribution?: string; version?: string }

const text = (value: unknown) => (typeof value === 'string' || typeof value === 'number' ? String(value).trim() : '')

const versionObject = (version: unknown): Record<string, unknown> | null =>
  version && typeof version === 'object' ? (version as Record<string, unknown>) : null

export const parseMajorVersion = (version: string) => {
  const major = parseInt(version, 10)
  return Number.isFinite(major) ? String(major) : ''
}

const parseDistribution = (version: Record<string, unknown> | null) => {
  if (!version) return UNKNOWN_DISTRIBUTION

  const distribution = text(version.distribution).toLowerCase()
  if (distribution) return distribution

  return text(version.number) ? DISTRIBUTIONS.elasticsearch : UNKNOWN_DISTRIBUTION
}

export const parseClusterInfo = (info: any): ClusterInfo => {
  const raw = versionObject(info?.version)
  const version = raw ? text(raw.number) : text(info?.version)

  return {
    clusterName: text(info?.cluster_name) || text(info?.name),
    version,
    majorVersion: parseMajorVersion(version),
    distribution: parseDistribution(raw),
    flavor: raw?.build_flavor === BuildFlavor.serverless ? BuildFlavor.serverless : BuildFlavor.default
  }
}

export const isElasticsearch = (distribution?: string) => !distribution || distribution === DISTRIBUTIONS.elasticsearch

export const isOpensearch = (distribution?: string) => distribution === DISTRIBUTIONS.opensearch

export const isSupportedDistribution = (distribution?: string) => isElasticsearch(distribution) || isOpensearch(distribution)

export const isSupportedVersion = ({ distribution, version }: ClusterIdentity) => {
  const major = parseMajorVersion(version || '')
  if (!major) return true
  if (isOpensearch(distribution)) return SUPPORTED_OPENSEARCH_MAJOR_VERSIONS.includes(major)
  if (isElasticsearch(distribution)) return SUPPORTED_MAJOR_VERSIONS.includes(major)
  return true
}

export const elasticsearchCompatibleVersion = ({ distribution, version }: ClusterIdentity) => {
  if (isOpensearch(distribution)) return OPENSEARCH_ELASTICSEARCH_VERSION
  if (isElasticsearch(distribution)) return version || ''
  return LATEST_ELASTICSEARCH_VERSION
}

export const productName = (distribution?: string) => {
  if (isOpensearch(distribution)) return 'OpenSearch'
  if (isElasticsearch(distribution)) return 'Elasticsearch'
  if (distribution === UNKNOWN_DISTRIBUTION) return ''
  return distribution!.charAt(0).toUpperCase() + distribution!.slice(1)
}
