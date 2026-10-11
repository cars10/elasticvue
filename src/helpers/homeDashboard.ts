import { prettyPrintByteString } from './bytes.ts'
import type {
  CatIndexRow,
  CounterSample,
  DiskWatermarks,
  NodeStatsEntry,
  NodesStatsBody,
  OverviewIndex,
  OverviewNode,
  WorkloadRates
} from '../types/homeDashboard.ts'

type JvmMem = NonNullable<NonNullable<NodeStatsEntry['jvm']>['mem']>

export const NODES_STATS_METRICS = 'jvm,fs,os,process,thread_pool,breaker,indices'

export const HOME_TABLE_LIMIT = 5

export const HOME_INDEX_PARAMS = {
  h: ['index', 'health', 'docs.count', 'store.size', 'pri', 'rep'],
  bytes: 'b',
  s: 'store.size:desc'
}

export const RATE_HISTORY_LIMIT = 24

export const DEFAULT_DISK_WATERMARKS: DiskWatermarks = {
  low: '85%',
  high: '90%',
  flood: '95%',
  lowPercent: 85,
  highPercent: 90,
  floodPercent: 95
}

export const EMPTY_WORKLOAD: WorkloadRates = {
  searchPerSec: null,
  indexingPerSec: null,
  deletePerSec: null,
  searchLatencyMs: null,
  indexingLatencyMs: null,
  rejectedDelta: null,
  breakerDelta: null,
  searchHistory: [],
  indexingHistory: [],
  searchLatencyHistory: []
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
export const parseElectedMasterNodeId = (state: {
  master_node?: string | null
  cluster_manager_node?: string | null
} | null): string | null => state?.master_node || state?.cluster_manager_node || null

export const parseNodesFromStats = (body: NodesStatsBody | null, masterNodeId?: string | null): OverviewNode[] => {
  if (!body?.nodes) return []

  return Object.entries(body.nodes).map(([id, node]) => {
    const total = node.fs?.total?.total_in_bytes
    const available = node.fs?.total?.available_in_bytes ?? node.fs?.total?.free_in_bytes
    const open = positiveOrNull(node.process?.open_file_descriptors)
    const max = positiveOrNull(node.process?.max_file_descriptors)
    const heapUsed = node.jvm?.mem?.heap_used_in_bytes
    const heapMax = node.jvm?.mem?.heap_max_in_bytes
    const cpu = positiveOrNull(node.os?.cpu?.percent) ?? positiveOrNull(node.process?.cpu?.percent)

    return {
      name: node.name || 'unknown',
      master: Boolean(masterNodeId && id === masterNodeId),
      heapPercent: heapPercentFromMem(node.jvm?.mem),
      heapCurrent: heapUsed != null ? prettyPrintByteString(heapUsed) : null,
      heapMax: heapMax != null ? prettyPrintByteString(heapMax) : null,
      diskPercent: diskPercentFromFs(total, available),
      cpuPercent: cpu,
      fileDescriptorPercent: fileDescriptorPercent(open, max),
      fileDescriptorsOpen: open,
      fileDescriptorsMax: max
    }
  })
}

/** Highest of CPU / heap / disk % — used to pick the busiest nodes for the home table. */
export const nodePressureScore = (node: OverviewNode): number =>
  Math.max(node.cpuPercent ?? 0, node.heapPercent ?? 0, node.diskPercent ?? 0)

export const topNodesByPressure = (nodes: OverviewNode[], limit = HOME_TABLE_LIMIT): OverviewNode[] =>
  [...nodes]
    .sort((a, b) => nodePressureScore(b) - nodePressureScore(a) || a.name.localeCompare(b.name))
    .slice(0, limit)

export const aggregateCounters = (body: NodesStatsBody | null): CounterSample | null => {
  if (!body?.nodes) return null

  let searchTotal = 0
  let searchTimeMs = 0
  let indexTotal = 0
  let indexTimeMs = 0
  let deleteTotal = 0
  let rejected = 0
  let breakerTrips = 0

  for (const node of Object.values(body.nodes)) {
    searchTotal += node.indices?.search?.query_total || 0
    searchTimeMs += node.indices?.search?.query_time_in_millis || 0
    indexTotal += node.indices?.indexing?.index_total || 0
    indexTimeMs += node.indices?.indexing?.index_time_in_millis || 0
    deleteTotal += node.indices?.indexing?.delete_total || 0
    rejected += sumThreadPoolRejected(node.thread_pool)
    breakerTrips += sumBreakerTrips(node.breakers)
  }

  return {
    at: Date.now(),
    searchTotal,
    searchTimeMs,
    indexTotal,
    indexTimeMs,
    deleteTotal,
    rejected,
    breakerTrips
  }
}

export const nextWorkloadRates = (
  prev: CounterSample,
  sample: CounterSample,
  current: WorkloadRates
): WorkloadRates | null => {
  if (sample.at <= prev.at) return null

  const elapsedSec = (sample.at - prev.at) / 1000
  if (elapsedSec <= 0) return null

  const searchDelta = Math.max(0, sample.searchTotal - prev.searchTotal)
  const indexDelta = Math.max(0, sample.indexTotal - prev.indexTotal)
  const deleteDelta = Math.max(0, sample.deleteTotal - prev.deleteTotal)
  const searchTimeDelta = Math.max(0, sample.searchTimeMs - prev.searchTimeMs)
  const indexTimeDelta = Math.max(0, sample.indexTimeMs - prev.indexTimeMs)

  const searchPerSec = searchDelta / elapsedSec
  const indexingPerSec = indexDelta / elapsedSec
  const deletePerSec = deleteDelta / elapsedSec
  const searchLatencyMs = searchDelta > 0 ? searchTimeDelta / searchDelta : current.searchLatencyMs
  const indexingLatencyMs = indexDelta > 0 ? indexTimeDelta / indexDelta : current.indexingLatencyMs

  const searchHistory = [...current.searchHistory, searchPerSec].slice(-RATE_HISTORY_LIMIT)
  const indexingHistory = [...current.indexingHistory, indexingPerSec].slice(-RATE_HISTORY_LIMIT)
  const searchLatencyHistory =
    searchLatencyMs != null
      ? [...current.searchLatencyHistory, searchLatencyMs].slice(-RATE_HISTORY_LIMIT)
      : current.searchLatencyHistory

  return {
    searchPerSec,
    indexingPerSec,
    deletePerSec,
    searchLatencyMs,
    indexingLatencyMs,
    rejectedDelta: Math.max(0, sample.rejected - prev.rejected),
    breakerDelta: Math.max(0, sample.breakerTrips - prev.breakerTrips),
    searchHistory,
    indexingHistory,
    searchLatencyHistory
  }
}

export const parseCatIndices = (rows: CatIndexRow[] | null): {
  indices: OverviewIndex[]
  /** Non-system indices considered for the home table (before the top-N slice). */
  eligibleCount: number
  unhealthy: { red: string[]; yellow: string[] }
} => {
  if (!rows?.length) {
    return { indices: [], eligibleCount: 0, unhealthy: { red: [], yellow: [] } }
  }

  const mapped: OverviewIndex[] = rows
    .filter((row) => row.index && !row.index.startsWith('.'))
    .map((row) => {
      const pri = toNumber(row.pri) || 0
      const rep = toNumber(row.rep) || 0
      return {
        index: row.index,
        health: (row.health || 'unknown').toLowerCase(),
        docs: toNumber(row['docs.count']) || 0,
        sizeBytes: toNumber(row['store.size']) || 0,
        shards: pri * (1 + rep)
      }
    })

  const unhealthyRows = mapped.filter((i) => i.health === 'yellow' || i.health === 'red')
  const rest = mapped.filter((i) => i.health !== 'yellow' && i.health !== 'red')

  return {
    indices: [...unhealthyRows, ...rest].slice(0, HOME_TABLE_LIMIT),
    eligibleCount: mapped.length,
    unhealthy: {
      red: unhealthyRows.filter((index) => index.health === 'red').map((index) => index.index),
      yellow: unhealthyRows.filter((index) => index.health === 'yellow').map((index) => index.index)
    }
  }
}

export const parseDiskWatermarks = (settings: {
  persistent?: Record<string, string | number>
  transient?: Record<string, string | number>
  defaults?: Record<string, string | number>
} | null): DiskWatermarks => {
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
