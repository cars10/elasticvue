import { describe, expect, it } from 'vitest'
import {
  addAllocationExclusion,
  clusterSettingsUpdate,
  drainCapacity,
  floodStageDiskSafe,
  effectiveSetting,
  indicesNeedingZeroReplicaHelper,
  mergeNodeAllocations,
  nodeDrainProgress,
  parseIndexToolStates,
  parseNodeAllocations,
  parseToolNodeInfos,
  removeAllocationExclusion,
  settingMode,
  summarizeAllocationExplanation,
  unassignedRemedies,
  userManagedIndices,
  validateWatermarks
} from '../../../src/helpers/clusterTools.ts'

describe('helpers/clusterTools.ts', () => {
  describe('effective settings', () => {
    it('reads an Elasticsearch default', () => {
      expect(
        effectiveSetting(
          { persistent: {}, transient: {}, defaults: { 'cluster.routing.allocation.enable': 'all' } },
          'cluster.routing.allocation.enable'
        )
      ).toEqual({
        key: 'cluster.routing.allocation.enable',
        configuredValue: null,
        defaultValue: 'all',
        effectiveValue: 'all',
        source: 'default'
      })
    })

    it('reads an explicit persistent value and honors transient precedence', () => {
      expect(
        effectiveSetting(
          {
            persistent: { 'cluster.routing.allocation.enable': 'none' },
            transient: { 'cluster.routing.allocation.enable': 'primaries' },
            defaults: { 'cluster.routing.allocation.enable': 'all' }
          },
          'cluster.routing.allocation.enable'
        )
      ).toMatchObject({ configuredValue: 'primaries', effectiveValue: 'primaries', source: 'transient' })
    })

    it('normalizes upper-case defaults from older Elasticsearch versions', () => {
      const setting = effectiveSetting(
        { defaults: { 'cluster.routing.allocation.enable': 'ALL' } },
        'cluster.routing.allocation.enable'
      )
      expect(settingMode(setting)).toBe('all')
    })
  })

  describe('node drain exclusions', () => {
    it('adds a node without destroying existing IDs or adding duplicates', () => {
      expect(addAllocationExclusion('node-a,node-b', 'node-c')).toBe('node-a,node-b,node-c')
      expect(addAllocationExclusion('node-a,node-b', 'node-b')).toBe('node-a,node-b')
    })

    it('removes only the selected node and resets after the last exclusion', () => {
      expect(removeAllocationExclusion('node-a,node-b', 'node-a')).toBe('node-b')
      expect(removeAllocationExclusion('node-a', 'node-a')).toBe('')
    })

    it('recognizes a completed drain when no shards remain', () => {
      expect(nodeDrainProgress(34, 0)).toBe(1)
      expect(nodeDrainProgress(34, 17)).toBe(0.5)
    })
  })

  describe('allocation explanations', () => {
    it('renders NO deciders', () => {
      const summary = summarizeAllocationExplanation(
        {
          index: 'logs',
          shard: 2,
          primary: false,
          allocate_explanation: 'cannot allocate',
          node_allocation_decisions: [
            {
              node_name: 'es-1',
              deciders: [
                { decider: 'disk_threshold', decision: 'NO', explanation: 'not enough free disk' },
                { decider: 'filter', decision: 'YES', explanation: 'allowed' }
              ]
            }
          ]
        },
        2
      )
      expect(summary.decisions).toEqual([{ decider: 'disk_threshold', explanation: 'not enough free disk', nodeName: 'es-1' }])
    })

    it('explains a replica on a single data node', () => {
      const summary = summarizeAllocationExplanation(
        {
          primary: false,
          node_allocation_decisions: [
            {
              node_name: 'only-node',
              deciders: [{ decider: 'same_shard', decision: 'NO', explanation: 'same copy exists' }]
            }
          ]
        },
        1
      )
      expect(summary.singleNodeReplica).toBe(true)
      expect(summary.reason).toBeNull()
    })
  })

  describe('index state', () => {
    const parsed = parseIndexToolStates({
      logs: {
        settings: {
          'index.number_of_replicas': '1',
          'index.refresh_interval': '5s',
          'index.blocks.read_only': 'true'
        }
      },
      products: { settings: { 'index.number_of_replicas': '0', 'index.blocks.write': true } },
      flood: { settings: { 'index.number_of_replicas': '1', 'index.blocks.read_only_allow_delete': 'true' } },
      '.security': { settings: { 'index.blocks.write': 'true' } },
      '.ds-events-000001': { settings: { 'index.number_of_replicas': '1' } }
    })

    it('detects user and flood-stage write blocks separately', () => {
      expect(parsed.find((index) => index.name === 'logs')?.blocks).toEqual(['read_only'])
      expect(parsed.find((index) => index.name === 'products')?.blocks).toEqual(['write'])
      expect(parsed.find((index) => index.name === 'flood')?.blocks).toEqual(['read_only_allow_delete'])
    })

    it('reads explicit refresh intervals', () => {
      expect(parsed.find((index) => index.name === 'logs')?.refreshInterval).toBe('5s')
      expect(parsed.find((index) => index.name === 'products')?.refreshInterval).toBeNull()
    })

    it('filters system and data-stream backing indices from bulk targets', () => {
      expect(userManagedIndices(parsed).map((index) => index.name)).toEqual(['logs', 'products', 'flood'])
    })

    it('targets only relevant indices for the single-node zero-replica helper', () => {
      expect(indicesNeedingZeroReplicaHelper(parsed, 1).map((index) => index.name)).toEqual(['logs', 'flood'])
      expect(indicesNeedingZeroReplicaHelper(parsed, 2)).toEqual([])
    })
  })

  describe('disk watermarks', () => {
    it('accepts correctly ordered percentages and byte values', () => {
      expect(validateWatermarks({ low: '85%', high: '90%', flood: '95%' })).toMatchObject({
        valid: true,
        mode: 'percent'
      })
      expect(validateWatermarks({ low: '100gb', high: '50gb', flood: '20gb' })).toMatchObject({
        valid: true,
        mode: 'bytes'
      })
    })

    it('rejects mixed modes and invalid ordering', () => {
      expect(validateWatermarks({ low: '85%', high: '50gb', flood: '95%' }).valid).toBe(false)
      expect(validateWatermarks({ low: '95%', high: '90%', flood: '85%' }).valid).toBe(false)
      expect(validateWatermarks({ low: '20gb', high: '50gb', flood: '100gb' }).valid).toBe(false)
    })
  })

  describe('nodes and allocations', () => {
    it('parses node infos and tolerates missing fields', () => {
      expect(parseToolNodeInfos({ nodes: { a: { name: 'node-a', roles: ['data'], attributes: { zone: 'x' } }, b: {} } })).toEqual([
        { id: 'a', name: 'node-a', roles: ['data'], attributes: { zone: 'x' } },
        { id: 'b', name: 'b', roles: [], attributes: {} }
      ])
      expect(parseToolNodeInfos(null)).toEqual([])
    })

    it('parses cat allocation rows and skips the unassigned row', () => {
      expect(
        parseNodeAllocations([
          { node: 'node-a', shards: '12', 'disk.avail': '4000', 'disk.percent': '60' },
          { node: 'node-b', shards: 3 },
          { node: 'UNASSIGNED', shards: '2' }
        ])
      ).toEqual({
        'node-a': { shardCount: 12, diskUsedPercent: 60, diskAvailableBytes: 4000 },
        'node-b': { shardCount: 3, diskUsedPercent: null, diskAvailableBytes: null }
      })
      expect(parseNodeAllocations(null)).toEqual({})
    })

    it('merges allocations by node name and defaults to no shards', () => {
      const infos = [
        { id: 'a', name: 'node-a', roles: [], attributes: {} },
        { id: 'c', name: 'constructor', roles: [], attributes: {} }
      ]
      const merged = mergeNodeAllocations(infos, { 'node-a': { shardCount: 5, diskUsedPercent: 10, diskAvailableBytes: 1 } })

      expect(merged[0]).toMatchObject({ id: 'a', shardCount: 5, diskUsedPercent: 10 })
      expect(merged[1]).toMatchObject({ id: 'c', shardCount: 0, diskUsedPercent: null, diskAvailableBytes: null })
    })
  })

  describe('index tool states from nested settings', () => {
    it('reads blocks, replicas and refresh interval from a filtered nested response', () => {
      const [state] = parseIndexToolStates({
        logs: { settings: { index: { number_of_replicas: '2', refresh_interval: '30s', blocks: { write: 'true' }, hidden: 'true' } } }
      })

      expect(state).toMatchObject({ name: 'logs', replicas: 2, refreshInterval: '30s', blocks: ['write'], hidden: true })
    })
  })
  describe('clusterSettingsUpdate', () => {
    const key = 'cluster.routing.allocation.enable'

    it('writes persistent and resets transient when null resets are supported', () => {
      expect(clusterSettingsUpdate({ [key]: 'none' }, null, true)).toEqual({
        persistent: { [key]: 'none' },
        transient: { [key]: null }
      })
    })

    it('sends no null resets to versions that reject them', () => {
      expect(clusterSettingsUpdate({ [key]: 'none' }, { transient: {}, persistent: {} }, false)).toEqual({
        persistent: { [key]: 'none' },
        transient: {}
      })
    })

    it('also overwrites an existing transient value when it cannot be reset', () => {
      expect(clusterSettingsUpdate({ [key]: 'none' }, { transient: { [key]: 'primaries' } }, false)).toEqual({
        persistent: { [key]: 'none' },
        transient: { [key]: 'none' }
      })
    })
  })
  describe('playbooks', () => {
    const node = (id: string, diskAvailableBytes: number | null, diskUsedPercent: number | null = 50) => ({
      id,
      name: `name-${id}`,
      roles: [],
      attributes: {},
      shardCount: 1,
      diskUsedPercent,
      diskAvailableBytes
    })

    it('checks if the remaining nodes can take the shards of a drained node', () => {
      const shards = [
        { index: 'a', shard: '0', prirep: 'p', state: 'STARTED', node: 'name-1', store: '600' },
        { index: 'a', shard: '0', prirep: 'r', state: 'STARTED', node: 'name-2', store: '600' },
        { index: 'b', shard: '0', prirep: 'p', state: 'STARTED', node: 'name-1', store: '500' }
      ]
      expect(drainCapacity(node('1', 100), [node('1', 100), node('2', 1000), node('3', null)], shards)).toEqual({
        targetCount: 1,
        requiredBytes: 1100,
        freeBytes: 1000,
        enough: false
      })
      expect(drainCapacity(node('1', 100), [node('1', 100), node('2', 5000)], shards).enough).toBe(true)
      expect(drainCapacity(node('1', 100), [node('1', 100)], shards)).toMatchObject({ targetCount: 0, enough: null })
    })

    it('checks disk usage against the flood stage watermark', () => {
      expect(floodStageDiskSafe([], '95%')).toBeNull()
      expect(floodStageDiskSafe([node('1', 10, 80)], '95%')).toBe(true)
      expect(floodStageDiskSafe([node('1', 10, 96)], '95%')).toBe(false)
      expect(floodStageDiskSafe([node('1', 10, null)], '95%')).toBeNull()
      expect(floodStageDiskSafe([node('1', 2048)], '1kb')).toBe(true)
      expect(floodStageDiskSafe([node('1', 512)], '1kb')).toBe(false)
    })

    it('suggests remedies for unassigned shards', () => {
      const summary = { primary: false, reason: null, decisions: [], singleNodeReplica: true }
      expect(
        unassignedRemedies({ allocationMode: 'none', summary, explanation: null, singleNodeReplicaCount: 2, canRetry: false })
      ).toEqual([
        { id: 'enable_allocation', recommended: true },
        { id: 'zero_replicas', recommended: true }
      ])
      expect(
        unassignedRemedies({
          allocationMode: 'all',
          summary: null,
          explanation: { unassigned_info: { reason: 'ALLOCATION_FAILED' } },
          singleNodeReplicaCount: 0,
          canRetry: true
        })
      ).toEqual([{ id: 'retry', recommended: true }])
      expect(
        unassignedRemedies({
          allocationMode: 'all',
          summary: { ...summary, singleNodeReplica: false },
          explanation: {},
          singleNodeReplicaCount: 0,
          canRetry: true
        })
      ).toEqual([{ id: 'retry', recommended: false }])
    })
  })
})
