import { flattenObj } from './flatten.ts'
import type { DiskWatermarks, MetricPeak, NodeStatsEntry, NodesStatsBody } from '../types/homeDashboard.ts'
import type { NodeStatsDetails } from '../types/nodes.ts'
import type { NodeSpread } from '../types/shards.ts'

type JvmMem = NonNullable<NonNullable<NodeStatsEntry['jvm']>['mem']>

export const CLUSTER_SETTINGS_PARAMS = {
  include_defaults: true,
  filter_path: '*.cluster.routing.allocation.disk.watermark,*.cluster.routing.allocation.enable'
}

type ClusterSettingsBody = {
  persistent?: Record<string, unknown>
  transient?: Record<string, unknown>
  defaults?: Record<string, unknown>
} | null

type FlatSettings = Record<string, string | number>

export const flatClusterSettings = (
  settings: ClusterSettingsBody
): { persistent: FlatSettings; transient: FlatSettings; defaults: FlatSettings } => ({
  persistent: flattenObj(settings?.persistent || {}),
  transient: flattenObj(settings?.transient || {}),
  defaults: flattenObj(settings?.defaults || {})
})

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
  const num = typeof value === 'string' ? parseFloat(value) : Number(value)
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

export const parseDiskWatermarks = (settings: ClusterSettingsBody): DiskWatermarks => {
  if (!settings) return { ...DEFAULT_DISK_WATERMARKS }

  const { persistent, transient, defaults } = flatClusterSettings(settings)

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

const SPREAD_SKEW_WARN = 1.5
const SPREAD_GAP_MIN = 5

export const nodeSpread = (entries: { name: string; count: number }[]): NodeSpread | null => {
  if (entries.length === 0) return null

  let busiest = entries[0]
  let min = Infinity
  let total = 0
  for (const entry of entries) {
    total += entry.count
    min = Math.min(min, entry.count)
    if (entry.count > busiest.count) busiest = entry
  }

  const avg = total / entries.length
  return {
    nodes: entries.length,
    min,
    max: busiest.count,
    avg,
    skew: avg > 0 ? busiest.count / avg : 1,
    busiest: busiest.name
  }
}

export const spreadUnbalanced = (spread: NodeSpread | null): boolean =>
  !!spread && spread.nodes > 1 && spread.skew >= SPREAD_SKEW_WARN && spread.max - spread.min >= SPREAD_GAP_MIN
