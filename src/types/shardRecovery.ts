type RecoveryNode = {
  id?: string
  host?: string
  transport_address?: string
  ip?: string
  name?: string
}

export type IndexRecovery = Record<
  string,
  {
    shards?: Array<{
      id: number
      type?: string
      stage?: string
      primary?: boolean
      start_time_in_millis?: number
      stop_time_in_millis?: number
      total_time_in_millis?: number
      source?: RecoveryNode
      target?: RecoveryNode
      index?: {
        size?: {
          total_in_bytes?: number
          recovered_in_bytes?: number
          percent?: string
        }
        files?: {
          total?: number
          recovered?: number
          percent?: string
        }
        source_throttle_time_in_millis?: number
        target_throttle_time_in_millis?: number
      }
      translog?: {
        recovered?: number
        total?: number
        percent?: string
      }
    }>
  }
>

export type ShardRecovery = {
  id: string
  index: string
  shard: number
  primary: boolean
  type: string
  stage: string
  active: boolean
  sourceNode: string | null
  sourceHost: string | null
  targetNode: string | null
  targetHost: string | null
  startTime: number | null
  stopTime: number | null
  durationMs: number | null
  bytesTotal: number | null
  bytesRecovered: number | null
  bytesPercent: number | null
  filesTotal: number | null
  filesRecovered: number | null
  filesPercent: number | null
  translogTotal: number | null
  translogRecovered: number | null
  translogPercent: number | null
  throttleMs: number
}

export type RecoverySummary = {
  active: number
  completed: number
  activeTypes: { type: string; count: number }[]
  bytesTotal: number
  bytesRecovered: number
  percent: number | null
  longest: ShardRecovery | null
  throttleMs: number
}
