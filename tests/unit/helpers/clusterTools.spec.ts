import { describe, expect, it } from 'vitest'
import {
  addAllocationExclusion,
  clusterToolIsSupported,
  clusterToolsCapabilities,
  effectiveSetting,
  indicesNeedingZeroReplicaHelper,
  nodeDrainProgress,
  parseIndexToolStates,
  persistentSettingBody,
  removeAllocationExclusion,
  summarizeAllocationExplanation,
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

    it('builds a null reset instead of hardcoding a default', () => {
      expect(persistentSettingBody('cluster.routing.allocation.enable', null)).toEqual({
        persistent: { 'cluster.routing.allocation.enable': null }
      })
    })
  })

  describe('node drain exclusions', () => {
    it('adds a node without destroying existing IDs or adding duplicates', () => {
      expect(addAllocationExclusion('node-a,node-b', 'node-c')).toBe('node-a,node-b,node-c')
      expect(addAllocationExclusion('node-a,node-b', 'node-b')).toBe('node-a,node-b')
    })

    it('removes only the selected node and resets after the last exclusion', () => {
      expect(removeAllocationExclusion('node-a,node-b', 'node-a')).toBe('node-b')
      expect(removeAllocationExclusion('node-a', 'node-a')).toBeNull()
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
      expect(summary.reason).toContain('primary and its replica')
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

  describe('capabilities', () => {
    it('gates version-specific options centrally', () => {
      expect(clusterToolsCapabilities('1.7.6')).toMatchObject({
        allocationExplain: false,
        retryFailed: false,
        floodStage: false,
        dataStreams: false,
        maxHeadroom: false,
        clusterReadOnlyAllowDelete: false,
        votingExclusions: false,
        expandWildcardsAll: false
      })
      expect(clusterToolsCapabilities('5.6.16')).toMatchObject({
        allocationExplain: true,
        retryFailed: true,
        floodStage: false,
        dataStreams: false,
        maxHeadroom: false,
        votingExclusions: false
      })
      expect(clusterToolsCapabilities('7.7.1')).toMatchObject({
        dataStreams: false,
        votingExclusions: false
      })
      expect(clusterToolsCapabilities('7.9.0')).toMatchObject({
        dataStreams: true,
        votingExclusions: true
      })
      expect(clusterToolsCapabilities('8.4.3').maxHeadroom).toBe(false)
      expect(clusterToolsCapabilities('8.5.0').maxHeadroom).toBe(true)
      expect(clusterToolsCapabilities('8.15.0')).toMatchObject({
        allocationExplain: true,
        retryFailed: true,
        floodStage: true,
        dataStreams: true,
        maxHeadroom: true,
        votingExclusions: true
      })
      expect(clusterToolsCapabilities('9.0.0')).toMatchObject({
        allocationExplain: true,
        retryFailed: true,
        votingExclusions: true
      })
      expect(clusterToolsCapabilities('2.12.0', true)).toMatchObject({
        allocationExplain: true,
        retryFailed: true,
        dataStreams: true,
        votingExclusions: true
      })
    })

    it('hides tools whose APIs do not exist in the connected version', () => {
      const es1 = clusterToolsCapabilities('1.7.6')
      expect(clusterToolIsSupported('allocation', es1)).toBe(true)
      expect(clusterToolIsSupported('explain', es1)).toBe(false)
      expect(clusterToolIsSupported('retry', es1)).toBe(false)
      expect(clusterToolIsSupported('voting', es1)).toBe(false)

      const es5 = clusterToolsCapabilities('5.6.16')
      expect(clusterToolIsSupported('explain', es5)).toBe(true)
      expect(clusterToolIsSupported('retry', es5)).toBe(true)
      expect(clusterToolIsSupported('voting', es5)).toBe(false)

      const es9 = clusterToolsCapabilities('9.0.0')
      expect(clusterToolIsSupported('explain', es9)).toBe(true)
      expect(clusterToolIsSupported('retry', es9)).toBe(true)
      expect(clusterToolIsSupported('voting', es9)).toBe(true)
    })
  })
})
