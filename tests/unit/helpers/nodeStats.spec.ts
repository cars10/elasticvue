import { describe, expect, it } from 'vitest'
import { parseNodeStatsDetails, peakMetric } from '../../../src/helpers/nodeStats'
import type { OverviewNode } from '../../../src/types/homeDashboard'

const node = (name: string, values: Partial<OverviewNode>): OverviewNode => ({
  name,
  heapPercent: null,
  diskPercent: null,
  cpuPercent: null,
  fileDescriptorPercent: null,
  ...values
})

describe('peakMetric', () => {
  it('returns the node with the highest value', () => {
    const nodes = [node('a', { diskPercent: 40 }), node('b', { diskPercent: 72 }), node('c', { diskPercent: 10 })]
    expect(peakMetric(nodes, 'diskPercent')).toEqual({ value: 72, node: 'b', detail: null })
  })

  it('ignores nodes without a value', () => {
    const nodes = [node('a', { cpuPercent: null }), node('b', { cpuPercent: 0 })]
    expect(peakMetric(nodes, 'cpuPercent')).toEqual({ value: 0, node: 'b', detail: null })
  })

  it('returns empty peak when no node has a value', () => {
    expect(peakMetric([node('a', {})], 'heapPercent')).toEqual({ value: null, node: null, detail: null })
  })

  it('adds detail for the peak node', () => {
    const nodes = [node('a', { heapPercent: 50, heapCurrent: '1gb', heapMax: '2gb' })]
    const peak = peakMetric(nodes, 'heapPercent', (n) => `${n.heapCurrent} / ${n.heapMax}`)
    expect(peak.detail).toBe('1gb / 2gb')
  })
})

describe('parseNodeStatsDetails', () => {
  it('reads uptime, docs and store size per node id', () => {
    const body = {
      nodes: {
        a: { jvm: { uptime_in_millis: 5000 }, indices: { docs: { count: 12 }, store: { size_in_bytes: 2048 } } },
        b: {}
      }
    }
    expect(parseNodeStatsDetails(body)).toEqual({
      a: { uptimeMs: 5000, docs: 12, storeBytes: 2048 },
      b: { uptimeMs: null, docs: null, storeBytes: null }
    })
  })

  it('returns an empty map without a body', () => {
    expect(parseNodeStatsDetails(null)).toEqual({})
  })
})
