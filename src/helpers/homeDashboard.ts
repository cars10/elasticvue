import { prettyPrintByteString } from './bytes.ts'
import {
  diskPercentFromFs,
  fileDescriptorPercent,
  heapPercentFromMem,
  positiveOrNull,
  sumBreakerTrips,
  sumThreadPoolRejected,
  toNumber
} from './nodeStats.ts'
import type {
  CatIndexRow,
  CounterSample,
  NodesStatsBody,
  OverviewIndex,
  OverviewNode,
  WorkloadRates
} from '../types/homeDashboard.ts'

export const HOME_TABLE_LIMIT = 5

export const HOME_INDEX_PARAMS = {
  h: ['index', 'health', 'docs.count', 'store.size', 'pri', 'rep'],
  bytes: 'b',
  s: 'store.size:desc'
}

export const RATE_HISTORY_LIMIT = 24

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
  [...nodes].sort((a, b) => nodePressureScore(b) - nodePressureScore(a) || a.name.localeCompare(b.name)).slice(0, limit)

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

export const nextWorkloadRates = (prev: CounterSample, sample: CounterSample, current: WorkloadRates): WorkloadRates | null => {
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

export const parseCatIndices = (
  rows: CatIndexRow[] | null
): {
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
