export interface SnapshotPolicyConfig {
  indices: string[]
  ignore_unavailable: boolean
  include_global_state: boolean
}

export interface SnapshotPolicyRetention {
  expire_after?: string
  max_count?: number
  min_count?: number
}

export interface SnapshotPolicy {
  schedule: string
  repository: string
  config: SnapshotPolicyConfig
  retention?: SnapshotPolicyRetention
}

export interface SnapshotPolicyResponse {
  [policyName: string]: {
    policy: SnapshotPolicy
  }
}

export interface SnapshotPolicyForm {
  name: string
  schedule: string
  repository: string
  indices: string
  ignoreUnavailable: boolean
  includeGlobalState: boolean
  retentionExpireAfter: string
  retentionMaxCount: number | null
  retentionMinCount: number | null
}

export interface SnapshotPolicyRequestBody {
  schedule: string
  repository: string
  config: SnapshotPolicyConfig
  retention?: SnapshotPolicyRetention
}

export type EmitFunction = (event: 'reload', ...args: unknown[]) => void

export interface SnapshotRepository {
  type: string
  settings: {
    location: string
    maxRestoreBytesPerSec?: string
    maxSnapshotBytesPerSec?: string
    readonly?: string
    compress?: string
    chunkSize?: string
  }
}

export interface ElasticsearchResponse {
  acknowledged?: boolean
  error?: {
    type: string
    reason: string
  }
  [key: string]: unknown
}
