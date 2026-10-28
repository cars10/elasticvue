export type AttentionAction = {
  label: string
  route: string
}

export type AttentionFinding = {
  id: string
  severity: 'critical' | 'warning' | 'info'
  title: string
  summary: string
  detail?: string
  entity?: {
    type: 'index' | 'node' | 'shard' | 'cluster'
    name: string
  }
  action?: AttentionAction
}

/** Always-rendered expanded checklist row — OK or a folded finding. */
export type AttentionCheck = {
  id: string
  title: string
  severity: 'critical' | 'warning' | 'info' | 'ok'
  summary: string[]
  detail: string[]
  action?: AttentionAction
}

export type ClusterStats = {
  cluster_name: string
  cluster_uuid?: string
  status: string
  nodes: {
    count: {
      total: number
      master?: number
      data?: number
      ingest?: number
      coordinating_only?: number
    }
    versions?: string[]
    jvm?: {
      mem?: {
        heap_used_in_bytes: number
        heap_max_in_bytes: number
      }
    }
    fs?: {
      total_in_bytes: number
      available_in_bytes: number
    }
  }
  indices: {
    count: number
    shards: {
      total: number
      primaries: number
    }
    docs: {
      count: number
      deleted?: number
    }
    store: {
      size_in_bytes: number
    }
  }
}

export type ClusterHealth = {
  status: string
  timed_out?: boolean
  number_of_nodes?: number
  number_of_data_nodes?: number
  active_primary_shards: number
  active_shards: number
  relocating_shards: number
  initializing_shards: number
  unassigned_shards: number
  /** Present on Elasticsearch 8.16+ / recent OpenSearch; unassigned primaries ⇒ red health */
  unassigned_primary_shards?: number
  number_of_pending_tasks?: number
  active_shards_percent_as_number?: number
}

export type OverviewNode = {
  name: string
  master?: boolean
  heapPercent: number | null
  heapCurrent?: string | null
  heapMax?: string | null
  diskPercent: number | null
  cpuPercent: number | null
  fileDescriptorPercent: number | null
  fileDescriptorsOpen?: number | null
  fileDescriptorsMax?: number | null
}

export type OverviewIndex = {
  index: string
  health: string
  docs: number
  sizeBytes: number
  shards: number
}

export type MetricPeak = {
  value: number | null
  node: string | null
  detail?: string | null
}

export type DiskWatermarks = {
  low: string
  high: string
  flood: string
  lowPercent: number | null
  highPercent: number | null
  floodPercent: number | null
}

export type WorkloadRates = {
  searchPerSec: number | null
  indexingPerSec: number | null
  deletePerSec: number | null
  searchLatencyMs: number | null
  indexingLatencyMs: number | null
  rejectedDelta: number | null
  breakerDelta: number | null
  searchHistory: number[]
  indexingHistory: number[]
  searchLatencyHistory: number[]
}

export type CounterSample = {
  at: number
  searchTotal: number
  searchTimeMs: number
  indexTotal: number
  indexTimeMs: number
  deleteTotal: number
  rejected: number
  breakerTrips: number
}

export type NodeStatsEntry = {
  name?: string
  roles?: string[]
  attributes?: Record<string, string>
  jvm?: {
    uptime_in_millis?: number
    mem?: {
      heap_used_percent?: number
      heap_used_in_bytes?: number
      heap_max_in_bytes?: number
    }
  }
  fs?: { total?: { total_in_bytes?: number; available_in_bytes?: number; free_in_bytes?: number } }
  os?: {
    cpu?: { percent?: number }
  }
  process?: {
    cpu?: { percent?: number }
    open_file_descriptors?: number
    max_file_descriptors?: number
  }
  indices?: {
    docs?: { count?: number }
    store?: { size_in_bytes?: number }
    search?: { query_total?: number; query_time_in_millis?: number }
    indexing?: { index_total?: number; index_time_in_millis?: number; delete_total?: number }
  }
  thread_pool?: Record<string, { rejected?: number }>
  breakers?: Record<string, { tripped?: number }>
}

export type NodesStatsBody = {
  nodes?: Record<string, NodeStatsEntry>
}

export type CatIndexRow = {
  index: string
  health?: string
  'docs.count'?: string | number
  'store.size'?: string | number
  pri?: string | number
  rep?: string | number
}

export type IndexBlock = {
  index: string
  /** e.g. write, read_only_allow_delete, read_only */
  kinds: string[]
}

export type PendingTaskInfo = {
  count: number
  /** Oldest task age in ms when available */
  oldestAgeMs: number | null
}

export type PressureSample = {
  at: number
  rejectedDelta: number
  breakerDelta: number
}

export type HeapSample = {
  at: number
  node: string
  heapPercent: number
}

/** cluster.routing.allocation.enable — defaults to "all" */
export type AllocationEnable = 'all' | 'primaries' | 'new_primaries' | 'none' | string
