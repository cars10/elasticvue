import { describe, expect, it } from 'vitest'
import {
  mapRepositories,
  mapSlmPolicies,
  mapSnapshots,
  repositoryLocation,
  runningSnapshots,
  snapshotStateColor,
  summarizeRepositories,
  summarizeSnapshots
} from '../../../src/helpers/snapshots'

const policy = (name: string, schedule: string, repository: string) => ({
  name,
  schedule,
  repository,
  config: { indices: [], ignore_unavailable: false, include_global_state: false }
})

const policies = mapSlmPolicies({
  nightly: {
    policy: policy('<nightly-{now/d}>', '0 30 1 * * ?', 'backups'),
    last_success: { time: 2000 },
    last_failure: { time: 1000, details: 'old failure' },
    next_execution_millis: 9000
  },
  hourly: {
    policy: policy('hourly', '0 0 * * * ?', 'backups'),
    last_success: { time: 1000 },
    last_failure: { time: 3000, details: 'repository missing' },
    next_execution_millis: 5000
  },
  fresh: { policy: policy('fresh', '0 0 0 * * ?', 's3') }
})

const repositories = mapRepositories(
  {
    backups: { type: 'fs', settings: { location: '/mnt/backups', compress: 'true' } },
    s3: { type: 's3', settings: { bucket: 'my-bucket', base_path: 'es/prod', readonly: 'true' } },
    archive: { type: 'url', settings: { url: 'http://example.com/archive' } }
  },
  policies
)

describe('repositoryLocation', () => {
  it('handles the common repository types', () => {
    expect(repositoryLocation('fs', { location: '/data' })).toBe('/data')
    expect(repositoryLocation('gcs', { bucket: 'b' })).toBe('b')
    expect(repositoryLocation('azure', { container: 'c', base_path: 'p' })).toBe('c/p')
    expect(repositoryLocation('hdfs', { uri: 'hdfs://nn:8020', path: '/snap' })).toBe('hdfs://nn:8020/snap')
    expect(repositoryLocation('source', { delegate_type: 'fs' })).toBe('fs')
    expect(repositoryLocation('custom', {})).toBe('')
  })
})

describe('mapSlmPolicies', () => {
  it('marks policies failing when the last failure is newer than the last success', () => {
    expect(policies.map((p) => [p.id, p.failing])).toEqual([
      ['fresh', false],
      ['hourly', true],
      ['nightly', false]
    ])
    expect(policies.find((p) => p.id === 'fresh')).toMatchObject({ lastSuccess: null, nextRun: null })
  })

  it('handles a missing response', () => {
    expect(mapSlmPolicies(null)).toEqual([])
  })
})

describe('mapRepositories', () => {
  it('sorts repositories, resolves locations and assigns policies', () => {
    expect(repositories.map((r) => [r.name, r.location, r.readonly])).toEqual([
      ['archive', 'http://example.com/archive', true],
      ['backups', '/mnt/backups', false],
      ['s3', 'my-bucket/es/prod', true]
    ])
    expect(repositories[1].policies.map((p) => p.id)).toEqual(['hourly', 'nightly'])
  })

  it('handles repositories without type or settings (ES 1.x / filtered responses)', () => {
    expect(mapRepositories({ bare: {} })).toEqual([
      { name: 'bare', type: '', location: '', readonly: false, settings: {}, policies: [] }
    ])
    expect(mapRepositories(null)).toEqual([])
  })
})

describe('summarizeRepositories', () => {
  it('summarizes types, policies and runs', () => {
    expect(summarizeRepositories(repositories, policies)).toEqual({
      total: 3,
      types: [
        { name: 'url', count: 1 },
        { name: 'fs', count: 1 },
        { name: 's3', count: 1 }
      ],
      readonly: 2,
      policies: 3,
      failingPolicies: ['hourly'],
      lastSuccess: { policy: 'nightly', time: 2000 },
      nextRun: { policy: 'hourly', time: 5000 }
    })
  })

  it('works without SLM', () => {
    expect(summarizeRepositories([], [])).toMatchObject({ total: 0, policies: 0, lastSuccess: null, nextRun: null })
  })
})

describe('runningSnapshots', () => {
  it('computes shard progress', () => {
    expect(
      runningSnapshots({
        snapshots: [
          { snapshot: 'a', repository: 'backups', shards_stats: { done: 1, total: 3 } },
          { snapshot: 'b', shards_stats: { done: 0, total: 0 } }
        ]
      })
    ).toEqual([
      { repository: 'backups', snapshot: 'a', percent: 33.3 },
      { repository: '', snapshot: 'b', percent: null }
    ])
    expect(runningSnapshots(null)).toEqual([])
  })
})

const snapshots = mapSnapshots({
  snapshots: [
    {
      snapshot: 'old',
      state: 'SUCCESS',
      indices: ['b', 'a'],
      start_time_in_millis: 1000,
      end_time_in_millis: 2000,
      duration_in_millis: 1000,
      failures: [],
      shards: { total: 2, failed: 0, successful: 2 }
    },
    {
      snapshot: 'broken',
      version: '8.15.0',
      state: 'PARTIAL',
      include_global_state: false,
      indices: ['logs'],
      start_time_in_millis: 5000,
      end_time_in_millis: 8000,
      duration_in_millis: 3000,
      failures: [{ index: 'logs', reason: 'IndexShardSnapshotFailedException' }],
      shards: { total: 2, failed: 1, successful: 1 }
    },
    {
      snapshot: 'running',
      state: 'IN_PROGRESS',
      start_time_in_millis: 9000,
      end_time_in_millis: 0,
      duration_in_millis: 123
    },
    { snapshot: 'success', state: 'SUCCESS', start_time_in_millis: 3000, end_time_in_millis: 6000, duration_in_millis: 3000 }
  ]
})

describe('mapSnapshots', () => {
  it('normalizes ES 1.x snapshots', () => {
    expect(snapshots[0]).toEqual({
      name: 'old',
      state: 'SUCCESS',
      startTime: 1000,
      endTime: 2000,
      durationMs: 1000,
      indices: ['a', 'b'],
      shardsTotal: 2,
      shardsFailed: 0,
      shardsSuccessful: 2,
      failures: [],
      version: '',
      includeGlobalState: null,
      restorable: true
    })
  })

  it('keeps failures and version from newer versions', () => {
    expect(snapshots[1]).toMatchObject({
      version: '8.15.0',
      includeGlobalState: false,
      failures: ['logs: IndexShardSnapshotFailedException'],
      restorable: true
    })
  })

  it('has no duration or end time while in progress', () => {
    expect(snapshots[2]).toMatchObject({ endTime: null, durationMs: null, shardsTotal: null, restorable: false })
  })

  it('handles an empty repository', () => {
    expect(mapSnapshots({})).toEqual([])
    expect(mapSnapshots(null)).toEqual([])
  })
})

describe('summarizeSnapshots', () => {
  it('summarizes states, latest snapshots and failures', () => {
    const summary = summarizeSnapshots(snapshots)

    expect(summary.total).toBe(4)
    expect(summary.states).toEqual([
      { name: 'SUCCESS', count: 2 },
      { name: 'PARTIAL', count: 1 },
      { name: 'IN_PROGRESS', count: 1 }
    ])
    expect(summary.latest?.name).toBe('running')
    expect(summary.latestSuccess?.name).toBe('success')
    expect(summary.failed).toEqual([])
    expect(summary.partial).toEqual(['broken'])
    expect(summary.firstFailure).toBe('logs: IndexShardSnapshotFailedException')
    expect(summary.avgDurationMs).toBe(2000)
  })

  it('handles no snapshots', () => {
    expect(summarizeSnapshots([])).toEqual({
      total: 0,
      states: [],
      latest: null,
      latestSuccess: null,
      failed: [],
      partial: [],
      firstFailure: '',
      avgDurationMs: null
    })
  })
})

describe('snapshotStateColor', () => {
  it('maps states to colors', () => {
    expect(['SUCCESS', 'PARTIAL', 'IN_PROGRESS', 'FAILED', 'INCOMPATIBLE'].map(snapshotStateColor)).toEqual([
      'positive',
      'warning',
      'warning',
      'negative',
      'grey'
    ])
  })
})
