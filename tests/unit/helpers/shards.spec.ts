import { describe, expect, it } from 'vitest'
import {
  EsShard,
  OVERSIZED_SHARD_BYTES,
  problemShards,
  relocationTarget,
  shardNodeName,
  shardSeverity,
  summarizeShards
} from '../../../src/helpers/shards'

const shard = (values: Partial<EsShard>): EsShard => ({
  index: 'idx',
  shard: '0',
  prirep: 'p',
  state: 'STARTED',
  node: 'node-1',
  ...values
})

const relocating = shard({ state: 'RELOCATING', node: 'node-1 -> 10.0.0.2 abc123 node-2' })

describe('relocation parsing', () => {
  it('reads source and target from the relocating node string', () => {
    expect(shardNodeName(relocating)).toBe('node-1')
    expect(relocationTarget(relocating)).toBe('node-2')
  })

  it('keeps spaces in node names', () => {
    const spaced = shard({ state: 'RELOCATING', node: 'node one -> 10.0.0.2 abc123 node two' })
    expect(shardNodeName(spaced)).toBe('node one')
    expect(relocationTarget(spaced)).toBe('node two')
    expect(shardNodeName(shard({ node: 'node one' }))).toBe('node one')
  })

  it('has no target for other states', () => {
    expect(relocationTarget(shard({}))).toBeNull()
  })
})

describe('shardSeverity', () => {
  it('ranks unassigned primaries above replicas and moving shards', () => {
    expect(shardSeverity(shard({ state: 'UNASSIGNED', node: '' }))).toBe('critical')
    expect(shardSeverity(shard({ state: 'UNASSIGNED', node: '', prirep: 'r' }))).toBe('warning')
    expect(shardSeverity(shard({ state: 'INITIALIZING' }))).toBe('moving')
    expect(shardSeverity(shard({}))).toBeNull()
  })
})

describe('problemShards', () => {
  it('lists non-started shards, most severe first', () => {
    const list = problemShards([
      shard({}),
      shard({ state: 'INITIALIZING', index: 'b' }),
      shard({ state: 'UNASSIGNED', node: '', prirep: 'r', index: 'c' }),
      shard({ state: 'UNASSIGNED', node: '', index: 'd' })
    ])
    expect(list.map((s) => s.index)).toEqual(['d', 'c', 'b'])
  })
})

describe('summarizeShards', () => {
  it('counts shard states and unassigned reasons', () => {
    const summary = summarizeShards(
      [
        shard({}),
        shard({ prirep: 'r', node: 'node-2' }),
        shard({ state: 'INITIALIZING', index: 'b' }),
        relocating,
        shard({ state: 'UNASSIGNED', node: '', prirep: 'r', 'unassigned.reason': 'NODE_LEFT' }),
        shard({ state: 'UNASSIGNED', node: '', prirep: 'p', 'unassigned.reason': 'NODE_LEFT' }),
        shard({ state: 'UNASSIGNED', node: '', prirep: 'r' })
      ],
      ['node-1', 'node-2']
    )

    expect(summary).toMatchObject({
      total: 7,
      primaries: 4,
      replicas: 3,
      indices: 2,
      initializing: 1,
      relocating: 1,
      unassigned: 3,
      unassignedPrimaries: 1,
      unassignedReasons: [
        { reason: 'NODE_LEFT', count: 2 },
        { reason: 'UNKNOWN', count: 1 }
      ]
    })
  })

  it('includes data nodes without shards in the balance', () => {
    const summary = summarizeShards([shard({}), shard({ shard: '1' })], ['node-1', 'node-2'])
    expect(summary.spread).toMatchObject({ nodes: 2, min: 0, max: 2, busiest: 'node-1' })
  })

  it('tracks shard sizes from started shards', () => {
    const summary = summarizeShards(
      [
        shard({ store: '100' }),
        shard({ shard: '1', store: '300' }),
        shard({ prirep: 'r', store: String(OVERSIZED_SHARD_BYTES + 1) }),
        shard({ state: 'INITIALIZING', store: '999999999999' })
      ],
      []
    )
    expect(summary.avgPrimaryBytes).toBe(200)
    expect(summary.largest).toMatchObject({ prirep: 'r', bytes: OVERSIZED_SHARD_BYTES + 1 })
    expect(summary.oversized).toBe(1)
  })

  it('handles clusters without shards', () => {
    expect(summarizeShards([], [])).toMatchObject({ total: 0, spread: null, largest: null, avgPrimaryBytes: null })
  })
})
