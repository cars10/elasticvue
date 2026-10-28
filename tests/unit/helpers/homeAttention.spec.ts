import { describe, expect, it } from 'vitest'
import {
  buildAttentionChecks,
  buildAttentionFindings,
  detectAllocationSettings,
  detectIndexBlocks,
  detectMonitoringProblems,
  detectPendingTasks,
  detectRecentBreakerTrips,
  detectRecentRejections,
  detectShardProblems,
  detectVersionMismatch,
  parseAllocationEnable,
  parseIndexBlocks,
  parsePendingTasks,
  PENDING_TASK_AGE_MS
} from '../../../src/helpers/homeAttention'
import { DEFAULT_DISK_WATERMARKS } from '../../../src/helpers/nodeStats'
import type { AttentionDetectorInput } from '../../../src/helpers/homeAttention'
import type { ClusterHealth, ClusterStats, OverviewNode } from '../../../src/types/homeDashboard'

const t = (key: string, named?: Record<string, unknown>) => (named ? `${key} ${JSON.stringify(named)}` : key)

const baseInput = (overrides: Partial<AttentionDetectorInput> = {}): AttentionDetectorInput => ({
  health: null,
  stats: null,
  nodes: [],
  unhealthyIndices: { red: [], yellow: [] },
  diskWatermarks: { ...DEFAULT_DISK_WATERMARKS },
  allocationEnable: 'all',
  indexBlocks: [],
  pendingTasks: null,
  pressureSamples: [],
  heapSamples: [],
  nodesMonitoringAvailable: true,
  ...overrides
})

const yellowHealth = (overrides: Partial<ClusterHealth> = {}): ClusterHealth => ({
  status: 'yellow',
  active_primary_shards: 1,
  active_shards: 1,
  relocating_shards: 0,
  initializing_shards: 0,
  unassigned_shards: 2,
  number_of_pending_tasks: 0,
  number_of_data_nodes: 2,
  ...overrides
})

const redHealth = (overrides: Partial<ClusterHealth> = {}): ClusterHealth => ({
  ...yellowHealth(),
  status: 'red',
  unassigned_primary_shards: 2,
  unassigned_shards: 2,
  ...overrides
})

describe('helpers/homeAttention.ts', () => {
  describe('healthy cluster', () => {
    it('returns no findings', () => {
      const findings = buildAttentionFindings(
        t,
        baseInput({
          health: {
            status: 'green',
            active_primary_shards: 8,
            active_shards: 16,
            relocating_shards: 0,
            initializing_shards: 0,
            unassigned_shards: 0,
            number_of_pending_tasks: 0
          },
          stats: {
            cluster_name: 'test',
            status: 'green',
            nodes: { count: { total: 2 }, versions: ['8.14.3'] },
            indices: { count: 1, shards: { total: 16, primaries: 8 }, docs: { count: 0 }, store: { size_in_bytes: 0 } }
          } as ClusterStats
        })
      )
      expect(findings).toEqual([])
    })
  })

  describe('detectShardProblems', () => {
    it('collapses yellow cluster + yellow index + unassigned replicas into ONE warning', () => {
      const findings = detectShardProblems(
        t,
        baseInput({
          health: yellowHealth({ unassigned_shards: 2, number_of_data_nodes: 2 }),
          unhealthyIndices: { red: [], yellow: ['ksad'] }
        })
      )

      expect(findings).toHaveLength(1)
      expect(findings[0].id).toBe('unassigned-replicas')
      expect(findings[0].severity).toBe('warning')
      expect(findings[0].summary).toBe(
        'home.attention.findings.unassigned_replicas.summary_index {"count":2,"index":"ksad"}'
      )
      expect(findings[0].detail).toBe('home.attention.findings.unassigned_replicas.detail')
    })

    it('reports unassigned primaries as critical', () => {
      const findings = detectShardProblems(
        t,
        baseInput({
          health: redHealth({ unassigned_primary_shards: 2, unassigned_shards: 2 }),
          unhealthyIndices: { red: ['broken'], yellow: [] }
        })
      )

      expect(findings.some((f) => f.id === 'unassigned-primaries' && f.severity === 'critical')).toBe(true)
    })

    it('does not count replicas as primaries when the cluster does not report unassigned primaries', () => {
      const findings = detectShardProblems(
        t,
        baseInput({
          health: redHealth({ unassigned_primary_shards: undefined, unassigned_shards: 101 }),
          unhealthyIndices: { red: ['broken'], yellow: [] }
        })
      )

      expect(findings).toHaveLength(1)
      expect(findings[0].summary).toBe('home.attention.findings.unassigned_primaries.summary_unknown')
    })

    it('explains single-node cluster replica allocation', () => {
      const findings = detectShardProblems(
        t,
        baseInput({
          health: yellowHealth({ unassigned_shards: 2, number_of_data_nodes: 1 }),
          unhealthyIndices: { red: [], yellow: ['ksad'] }
        })
      )

      expect(findings).toHaveLength(1)
      expect(findings[0].detail).toBe('home.attention.findings.unassigned_replicas.detail_single_node')
    })
  })

  describe('detectIndexBlocks', () => {
    it('creates a finding for read-only indices', () => {
      const findings = detectIndexBlocks(t, [{ index: 'logs-2026.10.05', kinds: ['read_only_allow_delete'] }])
      expect(findings).toHaveLength(1)
      expect(findings[0].severity).toBe('critical')
      expect(findings[0].title).toBe('home.attention.findings.index_blocks.title_read_only')
      expect(findings[0].summary).toContain('logs-2026.10.05')
    })

    it('groups many blocked indices into one finding', () => {
      const findings = detectIndexBlocks(t, [
        { index: 'a', kinds: ['write'] },
        { index: 'b', kinds: ['write'] }
      ])
      expect(findings).toHaveLength(1)
      expect(findings[0].severity).toBe('warning')
      expect(findings[0].summary).toBe('home.attention.findings.index_blocks.summary_many {"count":2,"index":"a"}')
    })
  })

  describe('detectDiskProblems', () => {
    it('creates a finding when disk watermark is exceeded', () => {
      const nodes: OverviewNode[] = [
        {
          name: 'es-8-node-1',
          heapPercent: 40,
          diskPercent: 91,
          cpuPercent: 10,
          fileDescriptorPercent: 1
        }
      ]
      const findings = buildAttentionFindings(t, baseInput({ nodes }))
      expect(findings.some((f) => f.id.startsWith('disk-watermark:') || f.id.startsWith('disk-flood:'))).toBe(true)
    })
  })

  describe('detectAllocationSettings', () => {
    it('creates a finding when allocation is disabled', () => {
      const findings = detectAllocationSettings(t, 'none')
      expect(findings).toHaveLength(1)
      expect(findings[0].id).toBe('allocation-disabled')
      expect(findings[0].summary).toBe('home.attention.findings.allocation.summary_none')
    })

    it('creates no finding when allocation is all', () => {
      expect(detectAllocationSettings(t, 'all')).toEqual([])
    })
  })

  describe('detectRecentRejections / breakers', () => {
    it('does not warn on empty pressure samples (historical counters alone)', () => {
      expect(detectRecentRejections(t, [], Date.now())).toEqual([])
      expect(detectRecentBreakerTrips(t, [], Date.now())).toEqual([])
    })

    it('warns when new rejection deltas appear in the window', () => {
      const now = Date.now()
      const findings = detectRecentRejections(
        t,
        [
          { at: now - 60_000, rejectedDelta: 10, breakerDelta: 0 },
          { at: now - 30_000, rejectedDelta: 27, breakerDelta: 0 }
        ],
        now
      )
      expect(findings).toHaveLength(1)
      expect(findings[0].summary).toContain('"count":37')
    })
  })

  describe('detectVersionMismatch', () => {
    it('reports mixed versions as info', () => {
      const findings = detectVersionMismatch(t, {
        cluster_name: 'test',
        status: 'green',
        nodes: { count: { total: 3 }, versions: ['8.14.3', '8.13.4'] },
        indices: { count: 0, shards: { total: 0, primaries: 0 }, docs: { count: 0 }, store: { size_in_bytes: 0 } }
      })
      expect(findings).toHaveLength(1)
      expect(findings[0].severity).toBe('info')
      expect(findings[0].summary).toContain('8.14.3')
    })
  })

  describe('detectMonitoringProblems', () => {
    it('reports permission/stats failure without other findings', () => {
      const findings = detectMonitoringProblems(t, false, 3, 0)
      expect(findings).toHaveLength(1)
      expect(findings[0].id).toBe('monitoring')
      expect(findings[0].severity).toBe('info')
    })
  })

  describe('detectPendingTasks', () => {
    it('ignores pending tasks without proven age', () => {
      expect(detectPendingTasks(t, { count: 14, oldestAgeMs: null })).toEqual([])
    })

    it('warns when oldest task exceeds age threshold', () => {
      const findings = detectPendingTasks(t, { count: 14, oldestAgeMs: PENDING_TASK_AGE_MS + 17_000 })
      expect(findings).toHaveLength(1)
      expect(findings[0].summary).toContain('"count":14')
    })
  })

  describe('parsers', () => {
    it('parseAllocationEnable reads flat settings', () => {
      expect(
        parseAllocationEnable({
          transient: { 'cluster.routing.allocation.enable': 'none' },
          persistent: {},
          defaults: { 'cluster.routing.allocation.enable': 'all' }
        })
      ).toBe('none')
    })

    it('parseIndexBlocks extracts read-only indices', () => {
      const blocks = parseIndexBlocks({
        blocks: {
          indices: {
            'logs-2026.10.05': {
              '5': {
                description: 'index read-only (allow delete)',
                levels: ['write', 'metadata_write']
              }
            },
            '.security': {
              '5': { description: 'index read-only (allow delete)', levels: ['write'] }
            }
          }
        }
      })
      expect(blocks).toEqual([{ index: 'logs-2026.10.05', kinds: ['read_only_allow_delete'] }])
    })

    it('parseIndexBlocks ignores closed indices', () => {
      const blocks = parseIndexBlocks({
        blocks: {
          indices: {
            'closed-index': { '4': { description: 'index closed', levels: ['read', 'write'] } }
          }
        }
      })
      expect(blocks).toEqual([])
    })

    it('parsePendingTasks reads ages', () => {
      const info = parsePendingTasks({
        tasks: [
          { time_in_queue_millis: 1200 },
          { time_in_queue_millis: 47000 }
        ]
      })
      expect(info).toEqual({ count: 2, oldestAgeMs: 47000 })
    })
  })

  describe('buildAttentionFindings dedupe', () => {
    it('does not emit separate cluster-health or index-health findings for yellow replicas', () => {
      const findings = buildAttentionFindings(
        t,
        baseInput({
          health: yellowHealth({ unassigned_shards: 2 }),
          unhealthyIndices: { red: [], yellow: ['ksad'] }
        })
      )
      expect(findings.map((f) => f.id)).toEqual(['unassigned-replicas'])
    })
  })

  describe('buildAttentionChecks', () => {
    it('always returns every check, with OK when healthy', () => {
      const checks = buildAttentionChecks(
        t,
        baseInput({
          health: {
            status: 'green',
            active_primary_shards: 8,
            active_shards: 16,
            relocating_shards: 0,
            initializing_shards: 0,
            unassigned_shards: 0,
            number_of_pending_tasks: 0
          }
        })
      )
      expect(checks.length).toBeGreaterThanOrEqual(11)
      expect(checks.every((c) => c.severity === 'ok')).toBe(true)
    })

    it('folds shard findings into the shards check and keeps other checks OK', () => {
      const checks = buildAttentionChecks(
        t,
        baseInput({
          health: yellowHealth({ unassigned_shards: 2 }),
          unhealthyIndices: { red: [], yellow: ['ksad'] }
        })
      )
      const shards = checks.find((c) => c.id === 'shards')
      expect(shards?.severity).toBe('warning')
      expect(shards?.summary[0]).toContain('ksad')
      expect(checks.filter((c) => c.severity === 'ok').length).toBe(checks.length - 1)
    })
  })
})
