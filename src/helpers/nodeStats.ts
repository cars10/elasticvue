import type { DiskWatermarks, MetricPeak, NodeStatsEntry, NodesStatsBody } from '../types/homeDashboard.ts'
import type { NodeStatsDetails } from '../types/nodes.ts'

/**
 * Parsing for `_nodes/stats`, shared by the home dashboard and the nodes page.
 */

type JvmMem = NonNullable<NonNullable<NodeStatsEntry['jvm']>['mem']>

/** `indices/search,indexing,docs,store` limits the index stats to the counters we use; the full set is large. */
export const NODES_STATS_METRICS = 'jvm,fs,os,process,thread_pool,breaker,indices/search,indexing,docs,store'

export const DEFAULT_DISK_WATERMARKS: DiskWatermarks = {
  low: '85%',
  high: '90%',
  flood: '95%',
  lowPercent: 85,
  highPercent: 90,
  floodPercent: 95
}

export const toNumber = (value?: string | number | null): number | null => {
  if (value === undefined || value === null || value === '') return null
  const num = typeof value === 'string' ? parseFloat(value) : value
  return Number.isFinite(num) ? num : null
}

/** ES returns -1 for unknown CPU / FD values on some platforms. */
export const positiveOrNull = (value?: number | null): number | null => {
  if (value == null || value < 0) return null
  return value
}

export const diskPercentFromFs = (total?: number, available?: number): number | null => {
  if (total == null || available == null || total <= 0) return null
  return Math.round(((total - available) / total) * 1000) / 10
}

export const fileDescriptorPercent = (open?: number | null, max?: number | null): number | null => {
  const openFd = positiveOrNull(open)
  const maxFd = positiveOrNull(max)
  if (openFd == null || maxFd == null || maxFd <= 0) return null
  return Math.round((openFd / maxFd) * 1000) / 10
}

export const heapPercentFromMem = (mem?: JvmMem): number | null => {
  if (!mem) return null
  if (mem.heap_used_percent != null && mem.heap_used_percent >= 0) return mem.heap_used_percent
  if (mem.heap_used_in_bytes == null || mem.heap_max_in_bytes == null || mem.heap_max_in_bytes <= 0) return null
  return Math.round((mem.heap_used_in_bytes / mem.heap_max_in_bytes) * 1000) / 10
}

export const parseWatermarkPercent = (value?: string | number | null): number | null => {
  if (value == null || value === '') return null
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  const trimmed = String(value).trim()
  if (trimmed.endsWith('%')) {
    const num = parseFloat(trimmed.slice(0, -1))
    return Number.isFinite(num) ? num : null
  }
  // Absolute byte watermarks can't map to a fixed % threshold
  return null
}

export const pickSetting = (...values: Array<string | number | undefined | null>) => {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== '') return value
  }
  return undefined
}

export const sumThreadPoolRejected = (threadPool?: Record<string, { rejected?: number }>) => {
  if (!threadPool) return 0
  return Object.values(threadPool).reduce((sum, pool) => sum + (pool.rejected || 0), 0)
}

export const sumBreakerTrips = (breakers?: Record<string, { tripped?: number }>) => {
  if (!breakers) return 0
  return Object.values(breakers).reduce((sum, breaker) => sum + (breaker.tripped || 0), 0)
}

/** Elected master id from `_cluster/state/master_node` (OpenSearch: `cluster_manager_node`). */
export const parseElectedMasterNodeId = (
  state: {
    master_node?: string | null
    cluster_manager_node?: string | null
  } | null
): string | null => state?.master_node || state?.cluster_manager_node || null

export const parseDiskWatermarks = (
  settings: {
    persistent?: Record<string, string | number>
    transient?: Record<string, string | number>
    defaults?: Record<string, string | number>
  } | null
): DiskWatermarks => {
  if (!settings) return { ...DEFAULT_DISK_WATERMARKS }

  const persistent = settings.persistent || {}
  const transient = settings.transient || {}
  const defaults = settings.defaults || {}

  const low = pickSetting(
    transient['cluster.routing.allocation.disk.watermark.low'],
    persistent['cluster.routing.allocation.disk.watermark.low'],
    defaults['cluster.routing.allocation.disk.watermark.low'],
    DEFAULT_DISK_WATERMARKS.low
  )
  const high = pickSetting(
    transient['cluster.routing.allocation.disk.watermark.high'],
    persistent['cluster.routing.allocation.disk.watermark.high'],
    defaults['cluster.routing.allocation.disk.watermark.high'],
    DEFAULT_DISK_WATERMARKS.high
  )
  // flood_stage added in ES 6.0 — null/missing → keep default
  const flood = pickSetting(
    transient['cluster.routing.allocation.disk.watermark.flood_stage'],
    persistent['cluster.routing.allocation.disk.watermark.flood_stage'],
    defaults['cluster.routing.allocation.disk.watermark.flood_stage'],
    DEFAULT_DISK_WATERMARKS.flood
  )

  return {
    low: String(low),
    high: String(high),
    flood: String(flood),
    lowPercent: parseWatermarkPercent(low),
    highPercent: parseWatermarkPercent(high),
    floodPercent: parseWatermarkPercent(flood)
  }
}

type NumericKey<T> = { [K in keyof T]-?: T[K] extends number | null | undefined ? K : never }[keyof T]

/** Node with the highest value for `key`, e.g. the node with the fullest disk. */
export const peakMetric = <T extends { name: string }>(
  nodes: T[],
  key: NumericKey<T>,
  detail?: (node: T) => string | null
): MetricPeak => {
  let peak: T | null = null
  for (const node of nodes) {
    const value = node[key] as number | null | undefined
    if (value != null && (peak == null || value > (peak[key] as number))) peak = node
  }
  if (!peak) return { value: null, node: null, detail: null }
  return { value: peak[key] as number, node: peak.name, detail: detail?.(peak) ?? null }
}

/** Slow-changing per-node values (uptime, docs, store) keyed by node id. */
export const parseNodeStatsDetails = (body: NodesStatsBody | null): Record<string, NodeStatsDetails> => {
  if (!body?.nodes) return {}

  return Object.fromEntries(
    Object.entries(body.nodes).map(([id, node]) => [
      id,
      {
        uptimeMs: positiveOrNull(node.jvm?.uptime_in_millis),
        docs: positiveOrNull(node.indices?.docs?.count),
        storeBytes: positiveOrNull(node.indices?.store?.size_in_bytes)
      }
    ])
  )
}
