export type NodeSpread = {
  nodes: number
  min: number
  max: number
  avg: number
  skew: number
  busiest: string
}

export type ShardCount = { reason: string; count: number }

export type ShardsSummary = {
  total: number
  primaries: number
  replicas: number
  indices: number
  initializing: number
  relocating: number
  unassigned: number
  unassignedPrimaries: number
  unassignedReasons: ShardCount[]
  spread: NodeSpread | null
  largest: { index: string; shard: string; prirep: string; bytes: number } | null
  avgPrimaryBytes: number | null
  oversized: number
}
