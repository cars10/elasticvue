import { describe, it, expect } from 'vitest'

import {
  buildNodeRows,
  formatCount,
  formatUptime,
  nodeRoleLabels,
  nodeRoleTitle,
  summarizeNodes
} from '../../../src/helpers/nodes'
import { DEFAULT_DISK_WATERMARKS } from '../../../src/helpers/nodeStats'
import type { EsNode } from '../../../src/types/types'
import type { NodeRow } from '../../../src/types/nodes'

const NEWLINE = '\r\n'

describe.concurrent('helpers/nodes.ts', () => {
  describe.concurrent('nodes.ts nodeRoleTitle', () => {
    it('should return empty string when supplied with empty string', () => {
      expect(nodeRoleTitle('')).toBe('')
    })

    it('should return all role titles when input string contains them all', () => {
      // include all lowercase latin alphabet characters and hyphen character for future proofing
      const nodes = new Set(nodeRoleTitle('abcdefghijklmnopqrstuvwxyz-').trimEnd().split(NEWLINE))

      expect(nodes.size).toBe(13)

      expect(nodes).toContain('c - cold node')
      expect(nodes).toContain('d - data node')
      expect(nodes).toContain('f - frozen node')
      expect(nodes).toContain('h - hot node')
      expect(nodes).toContain('i - ingest node')
      expect(nodes).toContain('l - machine learning node')
      expect(nodes).toContain('m - master-eligible node')
      expect(nodes).toContain('r - remote cluster client node')
      expect(nodes).toContain('s - content node')
      expect(nodes).toContain('t - transform node')
      expect(nodes).toContain('v - voting-only node')
      expect(nodes).toContain('w - warm node')
      expect(nodes).toContain('coordinating nodes')
    })

    it('should only include a single role title when input is a single role character', () => {
      const supportedRoles = new Map([
        ['c', 'c - cold node'],
        ['d', 'd - data node'],
        ['f', 'f - frozen node'],
        ['h', 'h - hot node'],
        ['i', 'i - ingest node'],
        ['l', 'l - machine learning node'],
        ['m', 'm - master-eligible node'],
        ['r', 'r - remote cluster client node'],
        ['s', 's - content node'],
        ['t', 't - transform node'],
        ['v', 'v - voting-only node'],
        ['w', 'w - warm node'],
        ['-', 'coordinating nodes']
      ])

      for (const [role, title] of supportedRoles) {
        expect(nodeRoleTitle(role).trimEnd()).toBe(title)
      }
    })

    it('should return an empty string for all unsupported latin-1 lowercase letters', () => {
      const unsupportedRoleTypes = ['a', 'b', 'e', 'g', 'j', 'k', 'n', 'o', 'p', 'q', 'u', 'x', 'y', 'z']

      for (const role of unsupportedRoleTypes) {
        expect(nodeRoleTitle(role)).toBe('')
      }
    })
  })
})
const catNode = (values: Partial<EsNode>): EsNode => ({
  name: 'node-1',
  id: 'id-1',
  ip: '10.0.0.1',
  version: '8.15.0',
  'heap.percent': '40',
  'heap.current': '400',
  'heap.max': '1000',
  'disk.used_percent': '50',
  'disk.used': '50',
  'disk.total': '100',
  cpu: '10',
  'node.role': 'dim',
  master: '-',
  attributes: {},
  ...values
})

const rowsOf = (...nodes: Partial<EsNode>[]): NodeRow[] => buildNodeRows(nodes.map(catNode), {}, {})

describe('nodeRoleLabels', () => {
  it('collapses data tiers into the generic data role and hides remote cluster client', () => {
    expect(nodeRoleLabels('cdfhilmrstw').map((r) => r.label)).toEqual(['master', 'data', 'ingest', 'ml', 'transform'])
  })

  it('shows tiers when the node has no generic data role', () => {
    expect(nodeRoleLabels('hs').map((r) => r.label)).toEqual(['content', 'hot'])
  })

  it('labels coordinating-only nodes', () => {
    expect(nodeRoleLabels('-').map((r) => r.label)).toEqual(['coordinating'])
  })
})

describe('buildNodeRows', () => {
  it('parses cat values and merges stats enrichment by node id', () => {
    const [row] = buildNodeRows(
      [catNode({ master: '*', shards: '7' })],
      { 'id-1': { uptimeMs: 1000, docs: 5, storeBytes: 10 } },
      { 'id-1': { zone: 'a' } }
    )

    expect(row).toMatchObject({
      master: true,
      heapPercent: 40,
      heapUsedBytes: 400,
      diskTotalBytes: 100,
      shards: 7,
      uptimeMs: 1000,
      docs: 5,
      attributes: { zone: 'a' }
    })
  })

  it('leaves stats fields empty without enrichment', () => {
    const [row] = rowsOf({})
    expect(row).toMatchObject({ shards: null, uptimeMs: null, docs: null, attributes: {} })
  })
})

describe('summarizeNodes', () => {
  it('counts roles and detects mixed versions', () => {
    const summary = summarizeNodes(
      rowsOf({ 'node.role': 'm' }, { 'node.role': 'dim', version: '8.14.0' }, { 'node.role': '-' }),
      DEFAULT_DISK_WATERMARKS
    )
    expect(summary.total).toBe(3)
    expect(summary.roles).toEqual({ masterEligible: 2, data: 1, ingest: 1, ml: 0, coordinating: 1 })
    expect(summary.versions).toEqual(['8.14.0', '8.15.0'])
  })

  it('averages cpu and heap and finds the peak node', () => {
    const summary = summarizeNodes(
      rowsOf({ name: 'a', cpu: '10', 'heap.percent': '20' }, { name: 'b', cpu: '30', 'heap.percent': '80' }),
      DEFAULT_DISK_WATERMARKS
    )
    expect(summary.cpu.avg).toBe(20)
    expect(summary.cpu.peak.node).toBe('b')
    expect(summary.heap.avg).toBe(50)
    expect(summary.heap.peak).toMatchObject({ value: 80, node: 'b' })
  })

  it('sums disk over data nodes and counts nodes at their highest watermark', () => {
    const summary = summarizeNodes(
      rowsOf(
        { 'disk.used_percent': '50', 'disk.used': '50', 'disk.total': '100' },
        { 'disk.used_percent': '87', 'disk.used': '87', 'disk.total': '100' },
        { 'disk.used_percent': '96', 'disk.used': '96', 'disk.total': '100' },
        { 'node.role': 'm', 'disk.used_percent': '99', 'disk.used': '99', 'disk.total': '100' }
      ),
      DEFAULT_DISK_WATERMARKS
    )
    expect(summary.disk).toMatchObject({ usedBytes: 233, totalBytes: 300, aboveLow: 1, aboveHigh: 0, aboveFlood: 1 })
  })

  it('reports shard spread across data nodes', () => {
    const summary = summarizeNodes(
      rowsOf({ name: 'a', shards: '10' }, { name: 'b', shards: '20' }, { name: 'm', 'node.role': 'm', shards: '0' }),
      DEFAULT_DISK_WATERMARKS
    )
    expect(summary.shards).toEqual({ nodes: 2, min: 10, max: 20, avg: 15, skew: 20 / 15, busiest: 'b' })
  })

  it('has no shard summary when shards are not reported', () => {
    expect(summarizeNodes(rowsOf({}), DEFAULT_DISK_WATERMARKS).shards).toBeNull()
  })

  it('lists recently restarted nodes', () => {
    const rows = buildNodeRows(
      [catNode({ id: 'a', name: 'a' }), catNode({ id: 'b', name: 'b' })],
      { a: { uptimeMs: 60_000, docs: null, storeBytes: null }, b: { uptimeMs: 86_400_000, docs: null, storeBytes: null } },
      {}
    )
    expect(summarizeNodes(rows, DEFAULT_DISK_WATERMARKS).recentlyRestarted).toEqual(['a'])
  })
})

describe('formatters', () => {
  it('formats uptime', () => {
    expect(formatUptime(null)).toBe('—')
    expect(formatUptime(5 * 60_000)).toBe('5m')
    expect(formatUptime(90 * 60_000)).toBe('1h 30m')
    expect(formatUptime(26 * 3_600_000)).toBe('1d 2h')
  })

  it('formats counts', () => {
    expect(formatCount(1500)).toBe('1.5K')
    expect(formatCount(null)).toBe('—')
  })
})
