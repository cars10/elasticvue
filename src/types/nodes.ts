import type { MetricPeak } from './homeDashboard.ts'
import type { NodeSpread } from './shards.ts'

export type NodeStatsDetails = {
  uptimeMs: number | null
  docs: number | null
  storeBytes: number | null
}

/** One row of the nodes table: `_cat/nodes` plus optional `_nodes/stats` enrichment. */
export type NodeRow = {
  id: string
  name: string
  ip: string
  version: string
  /** Role letters as returned by `_cat/nodes`, e.g. `dimr`; `-` for coordinating-only. */
  roles: string
  master: boolean
  attributes: Record<string, string>
  cpuPercent: number | null
  heapPercent: number | null
  heapUsedBytes: number | null
  heapMaxBytes: number | null
  diskPercent: number | null
  diskUsedBytes: number | null
  diskTotalBytes: number | null
  shards: number | null
  uptimeMs: number | null
  docs: number | null
  storeBytes: number | null
}

export type NodeRoleCounts = {
  masterEligible: number
  data: number
  ingest: number
  ml: number
  coordinating: number
}

export type NodesSummary = {
  total: number
  roles: NodeRoleCounts
  versions: string[]
  /** Names of nodes whose JVM started within RECENT_RESTART_MS. */
  recentlyRestarted: string[]
  cpu: { avg: number | null; peak: MetricPeak }
  heap: { avg: number | null; peak: MetricPeak }
  disk: {
    usedBytes: number
    totalBytes: number
    percent: number | null
    /** Nodes counted at the highest watermark they crossed. */
    aboveLow: number
    aboveHigh: number
    aboveFlood: number
  }
  /** Shard spread across data nodes; null when the cluster does not report shards per node (ES < 8). */
  shards: NodeSpread | null
}
