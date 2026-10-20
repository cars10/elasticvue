import { describe, expect, it } from 'vitest'
import { peakMetric } from '../../../src/helpers/homeDashboard'
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
