import type { MetricPeak } from './homeDashboard.ts'
import type { NodeSpread } from './shards.ts'

export type NodeStatsDetails = {
  uptimeMs: number | null
  docs: number | null
  storeBytes: number | null
}

export type NodeRow = {
  id: string
  name: string
  ip: string
  version: string
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
  recentlyRestarted: string[]
  cpu: { avg: number | null; peak: MetricPeak }
  heap: { avg: number | null; peak: MetricPeak }
  disk: {
    usedBytes: number
    totalBytes: number
    percent: number | null
    aboveLow: number
    aboveHigh: number
    aboveFlood: number
  }
  shards: NodeSpread | null
}
