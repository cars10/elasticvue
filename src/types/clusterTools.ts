import type { RequestState } from '../composables/CallElasticsearch.ts'

export type SettingSource = 'transient' | 'persistent' | 'default' | 'unavailable'

export type EffectiveSetting<T = string> = {
  key: string
  configuredValue: T | null
  defaultValue: T | null
  effectiveValue: T | null
  source: SettingSource
}

export type FlatClusterSettings = {
  transient?: Record<string, string | number | boolean | null>
  persistent?: Record<string, string | number | boolean | null>
  defaults?: Record<string, string | number | boolean | null>
}

export type ToolShard = {
  index: string
  shard: string
  prirep: 'p' | 'r' | string
  state: string
  node?: string
  store?: string
  'unassigned.reason'?: string
}

export type ToolNode = {
  id: string
  name: string
  roles: string[]
  attributes: Record<string, string>
  shardCount: number
  initialShardCount: number
  relocatingShards: number
  diskUsedPercent: number | null
  diskAvailableBytes: number | null
}

export type AllocationDecision = {
  decider: string
  explanation: string
  nodeName?: string
}

export type AllocationExplanation = {
  index?: string
  shard?: number
  primary?: boolean
  current_state?: string
  unassigned_info?: {
    reason?: string
    details?: string
  }
  allocate_explanation?: string
  node_allocation_decisions?: Array<{
    node_name?: string
    node_decision?: string
    deciders?: Array<{
      decider?: string
      decision?: string
      explanation?: string
    }>
  }>
}

export type AllocationSummary = {
  title: string
  reason: string
  decisions: AllocationDecision[]
  singleNodeReplica: boolean
}

export type IndexToolState = {
  name: string
  replicas: number | null
  refreshInterval: string | null
  blocks: string[]
  hidden: boolean
  dataStreamBacking: boolean
}

export type ToolRequest = {
  requestState: RequestState
  permissionDenied: boolean
  unsupported: boolean
}

export type WatermarkMode = 'percent' | 'bytes'

export type WatermarkValues = {
  low: string
  high: string
  flood: string
  lowMaxHeadroom?: string | null
  highMaxHeadroom?: string | null
  floodMaxHeadroom?: string | null
  thresholdEnabled?: boolean
}

export type WatermarkValidation = {
  valid: boolean
  mode: WatermarkMode | null
  error: string
}
