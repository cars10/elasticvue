import type {
  EsSnapshotList,
  EsSnapshotPolicy,
  EsSnapshotRepository,
  EsSnapshotStatusList,
  RepositoriesSummary,
  RepositoryRow,
  RunningSnapshot,
  SlmPolicy,
  SnapshotRow,
  SnapshotsSummary
} from '../types/snapshots.ts'

const filterPath = (prefix: string, fields: string[]) => ({ filter_path: fields.map((f) => `${prefix}.${f}`).join(',') })

export const REPOSITORIES_PARAMS = filterPath('*', ['type', 'settings'])

export const SNAPSHOTS_PARAMS = filterPath('snapshots', [
  'snapshot',
  'version',
  'state',
  'indices',
  'include_global_state',
  'start_time_in_millis',
  'end_time_in_millis',
  'duration_in_millis',
  'failures.index',
  'failures.reason',
  'shards'
])

export const SNAPSHOT_STATUS_PARAMS = filterPath('snapshots', [
  'snapshot',
  'repository',
  'shards_stats.done',
  'shards_stats.total'
])

export const SLM_POLICIES_PARAMS = filterPath('*', [
  'policy.name',
  'policy.schedule',
  'policy.repository',
  'policy.retention',
  'last_success.time',
  'last_failure.time',
  'last_failure.details',
  'next_execution_millis'
])

const str = (value: unknown) => (typeof value === 'string' || typeof value === 'number' ? String(value) : '')

const joinPath = (...parts: unknown[]) => parts.map(str).filter(Boolean).join('/')

export const repositoryLocation = (type: string, settings: Record<string, unknown>): string => {
  switch (type) {
    case 'fs':
      return str(settings.location)
    case 's3':
    case 'gcs':
      return joinPath(settings.bucket, settings.base_path)
    case 'azure':
      return joinPath(settings.container, settings.base_path)
    case 'url':
      return str(settings.url)
    case 'hdfs':
      return `${str(settings.uri)}${str(settings.path)}`
    case 'source':
      return str(settings.delegate_type)
    default:
      return str(settings.location) || str(settings.bucket) || str(settings.url)
  }
}

const isTrue = (value: unknown) => value === true || value === 'true'

const positiveTime = (value?: number | null) => (value && value > 0 ? value : null)

export const mapSlmPolicies = (body: Record<string, EsSnapshotPolicy> | null): SlmPolicy[] =>
  Object.entries(body || {})
    .map(([id, entry]) => {
      const lastSuccess = positiveTime(entry.last_success?.time)
      const lastFailure = positiveTime(entry.last_failure?.time)

      return {
        id,
        name: entry.policy?.name || id,
        schedule: entry.policy?.schedule || '',
        repository: entry.policy?.repository || '',
        retention: entry.policy?.retention,
        nextRun: positiveTime(entry.next_execution_millis),
        lastSuccess,
        lastFailure,
        lastFailureDetails: entry.last_failure?.details || '',
        failing: lastFailure !== null && (lastSuccess === null || lastFailure > lastSuccess)
      }
    })
    .sort((a, b) => a.id.localeCompare(b.id))

export const mapRepositories = (body: Record<string, EsSnapshotRepository> | null, policies: SlmPolicy[] = []): RepositoryRow[] =>
  Object.entries(body || {})
    .map(([name, repository]) => {
      const type = repository.type || ''
      const settings = repository.settings || {}

      return {
        name,
        type,
        location: repositoryLocation(type, settings),
        readonly: type === 'url' || isTrue(settings.readonly) || isTrue(settings.read_only),
        settings,
        policies: policies.filter((policy) => policy.repository === name)
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name))

const countBy = <T>(items: T[], key: (item: T) => string) => {
  const counts = new Map<string, number>()
  items.forEach((item) => counts.set(key(item), (counts.get(key(item)) || 0) + 1))
  return [...counts].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)
}

const extremeBy = <T>(items: T[], value: (item: T) => number | null, lowest = false) =>
  items.filter((item) => value(item) !== null).sort((a, b) => (lowest ? value(a)! - value(b)! : value(b)! - value(a)!))[0] || null

export const runningSnapshots = (status: EsSnapshotStatusList | null): RunningSnapshot[] =>
  (status?.snapshots || []).map((snapshot) => {
    const done = snapshot.shards_stats?.done
    const total = snapshot.shards_stats?.total

    return {
      repository: snapshot.repository || '',
      snapshot: snapshot.snapshot,
      percent: done != null && total ? Math.round((done / total) * 1000) / 10 : null
    }
  })

export const summarizeRepositories = (repositories: RepositoryRow[], policies: SlmPolicy[]): RepositoriesSummary => {
  const lastSuccess = extremeBy(policies, (policy) => policy.lastSuccess)
  const nextRun = extremeBy(policies, (policy) => policy.nextRun, true)

  return {
    total: repositories.length,
    types: countBy(repositories, (repository) => repository.type || 'unknown'),
    readonly: repositories.filter((repository) => repository.readonly).length,
    policies: policies.length,
    failingPolicies: policies.filter((policy) => policy.failing).map((policy) => policy.id),
    lastSuccess: lastSuccess ? { policy: lastSuccess.id, time: lastSuccess.lastSuccess! } : null,
    nextRun: nextRun ? { policy: nextRun.id, time: nextRun.nextRun! } : null
  }
}

const RESTORABLE_STATES = ['SUCCESS', 'PARTIAL']

export const mapSnapshots = (body: EsSnapshotList | null): SnapshotRow[] =>
  (body?.snapshots || []).map((snapshot) => {
    const state = (snapshot.state || 'UNKNOWN').toUpperCase()
    const endTime = positiveTime(snapshot.end_time_in_millis)

    return {
      name: snapshot.snapshot,
      state,
      startTime: positiveTime(snapshot.start_time_in_millis),
      endTime,
      durationMs: endTime ? (snapshot.duration_in_millis ?? null) : null,
      indices: [...(snapshot.indices || [])].sort(),
      shardsTotal: snapshot.shards?.total ?? null,
      shardsFailed: snapshot.shards?.failed ?? null,
      shardsSuccessful: snapshot.shards?.successful ?? null,
      failures: (snapshot.failures || [])
        .map((failure) => [failure.index, failure.reason].filter(Boolean).join(': '))
        .filter(Boolean),
      version: snapshot.version || '',
      includeGlobalState: snapshot.include_global_state ?? null,
      restorable: RESTORABLE_STATES.includes(state)
    }
  })

export const summarizeSnapshots = (snapshots: SnapshotRow[]): SnapshotsSummary => {
  const byStart = [...snapshots].sort((a, b) => (b.startTime || 0) - (a.startTime || 0))
  const successful = byStart.filter((snapshot) => snapshot.state === 'SUCCESS')
  const durations = successful.map((snapshot) => snapshot.durationMs).filter((ms): ms is number => ms !== null)
  const failed = byStart.filter((snapshot) => snapshot.state === 'FAILED')
  const partial = byStart.filter((snapshot) => snapshot.state === 'PARTIAL')

  return {
    total: snapshots.length,
    states: countBy(snapshots, (snapshot) => snapshot.state),
    latest: byStart[0] || null,
    latestSuccess: successful[0] || null,
    failed: failed.map((snapshot) => snapshot.name),
    partial: partial.map((snapshot) => snapshot.name),
    firstFailure: [...failed, ...partial].find((snapshot) => snapshot.failures.length)?.failures[0] || '',
    avgDurationMs: durations.length ? Math.round(durations.reduce((sum, ms) => sum + ms, 0) / durations.length) : null
  }
}

export const snapshotStateColor = (state: string): string => {
  switch (state) {
    case 'SUCCESS':
      return 'positive'
    case 'PARTIAL':
    case 'IN_PROGRESS':
      return 'warning'
    case 'FAILED':
      return 'negative'
    default:
      return 'grey'
  }
}
