import { positiveOrNull, toNumber } from './nodeStats.ts'
import type { IndexRecovery, RecoverySummary, ShardRecovery } from '../types/shardRecovery.ts'

export const RECOVERY_FILTER_PATH = [
  'id',
  'type',
  'stage',
  'primary',
  'start_time_in_millis',
  'stop_time_in_millis',
  'total_time_in_millis',
  'source.name',
  'source.host',
  'target.name',
  'target.host',
  'index.size.total_in_bytes',
  'index.size.recovered_in_bytes',
  'index.size.percent',
  'index.files.total',
  'index.files.recovered',
  'index.files.percent',
  'index.source_throttle_time_in_millis',
  'index.target_throttle_time_in_millis',
  'translog.recovered',
  'translog.total',
  'translog.percent'
]
  .map((field) => `*.shards.${field}`)
  .join(',')

const parsePercent = (value?: string | null, total?: number | null): number | null =>
  total === 0 ? null : toNumber(value?.replace('%', ''))

export const parseRecoveries = (body: IndexRecovery | null): ShardRecovery[] => {
  if (!body) return []

  const recoveries: ShardRecovery[] = []
  for (const [index, data] of Object.entries(body)) {
    for (const shard of data?.shards || []) {
      const stage = (shard.stage || 'UNKNOWN').toUpperCase()
      const targetNode = shard.target?.name || null

      recoveries.push({
        id: `${index}-${shard.id}-${shard.primary ? 'p' : 'r'}-${targetNode}-${shard.start_time_in_millis}`,
        index,
        shard: shard.id,
        primary: !!shard.primary,
        type: (shard.type || 'unknown').toLowerCase(),
        stage,
        active: stage !== 'DONE',
        sourceNode: shard.source?.name || null,
        sourceHost: shard.source?.host || null,
        targetNode,
        targetHost: shard.target?.host || null,
        startTime: positiveOrNull(shard.start_time_in_millis),
        stopTime: positiveOrNull(shard.stop_time_in_millis) || null,
        durationMs: positiveOrNull(shard.total_time_in_millis),
        bytesTotal: positiveOrNull(shard.index?.size?.total_in_bytes),
        bytesRecovered: positiveOrNull(shard.index?.size?.recovered_in_bytes),
        bytesPercent: parsePercent(shard.index?.size?.percent, shard.index?.size?.total_in_bytes),
        filesTotal: positiveOrNull(shard.index?.files?.total),
        filesRecovered: positiveOrNull(shard.index?.files?.recovered),
        filesPercent: parsePercent(shard.index?.files?.percent, shard.index?.files?.total),
        translogTotal: positiveOrNull(shard.translog?.total),
        translogRecovered: positiveOrNull(shard.translog?.recovered),
        translogPercent: parsePercent(shard.translog?.percent, shard.translog?.total),
        throttleMs:
          (positiveOrNull(shard.index?.source_throttle_time_in_millis) || 0) +
          (positiveOrNull(shard.index?.target_throttle_time_in_millis) || 0)
      })
    }
  }

  return recoveries.sort((a, b) => Number(b.active) - Number(a.active) || (b.startTime || 0) - (a.startTime || 0))
}

export const summarizeRecoveries = (recoveries: ShardRecovery[]): RecoverySummary => {
  const active = recoveries.filter((recovery) => recovery.active)

  const types: Record<string, number> = {}
  let bytesTotal = 0
  let bytesRecovered = 0
  let throttleMs = 0
  let longest: ShardRecovery | null = null

  for (const recovery of active) {
    types[recovery.type] = (types[recovery.type] || 0) + 1
    bytesTotal += recovery.bytesTotal || 0
    bytesRecovered += recovery.bytesRecovered || 0
    throttleMs += recovery.throttleMs
    if ((recovery.durationMs || 0) > (longest?.durationMs || 0)) longest = recovery
  }

  return {
    active: active.length,
    completed: recoveries.length - active.length,
    activeTypes: Object.entries(types)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count || a.type.localeCompare(b.type)),
    bytesTotal,
    bytesRecovered,
    percent: bytesTotal > 0 ? (bytesRecovered / bytesTotal) * 100 : null,
    longest,
    throttleMs
  }
}
