import type { SnapshotPolicy } from './snapshotPolicies.ts'

export type EsSnapshotRepository = {
  type?: string
  settings?: Record<string, unknown>
}

type EsSnapshotFailure = {
  index?: string
  reason?: string
}

export type EsSnapshot = {
  snapshot: string
  version?: string
  state?: string
  indices?: string[]
  include_global_state?: boolean
  start_time_in_millis?: number
  end_time_in_millis?: number
  duration_in_millis?: number
  failures?: EsSnapshotFailure[]
  shards?: {
    total?: number
    failed?: number
    successful?: number
  }
}

export type EsSnapshotList = {
  snapshots?: EsSnapshot[]
}

export type EsSnapshotStatusList = {
  snapshots?: {
    snapshot: string
    repository?: string
    shards_stats?: {
      done?: number
      total?: number
    }
  }[]
}

type EsSlmInvocation = {
  time?: number
  details?: string
}

export type EsSnapshotPolicy = {
  policy: SnapshotPolicy & { name: string }
  last_success?: EsSlmInvocation
  last_failure?: EsSlmInvocation
  next_execution_millis?: number
}

export type SlmPolicy = {
  id: string
  name: string
  schedule: string
  repository: string
  retention: SnapshotPolicy['retention']
  nextRun: number | null
  lastSuccess: number | null
  lastFailure: number | null
  lastFailureDetails: string
  failing: boolean
}

export type RepositoryRow = {
  name: string
  type: string
  location: string
  readonly: boolean
  settings: Record<string, unknown>
  policies: SlmPolicy[]
}

export type RunningSnapshot = {
  repository: string
  snapshot: string
  percent: number | null
}

export type NameCount = { name: string; count: number }

export type RepositoriesSummary = {
  total: number
  types: NameCount[]
  readonly: number
  policies: number
  failingPolicies: string[]
  lastSuccess: { policy: string; time: number } | null
  nextRun: { policy: string; time: number } | null
}

export type SnapshotRow = {
  name: string
  state: string
  startTime: number | null
  endTime: number | null
  durationMs: number | null
  indices: string[]
  shardsTotal: number | null
  shardsFailed: number | null
  shardsSuccessful: number | null
  failures: string[]
  version: string
  includeGlobalState: boolean | null
  restorable: boolean
}

export type SnapshotsSummary = {
  total: number
  states: NameCount[]
  latest: SnapshotRow | null
  latestSuccess: SnapshotRow | null
  failed: string[]
  partial: string[]
  firstFailure: string
  avgDurationMs: number | null
}
