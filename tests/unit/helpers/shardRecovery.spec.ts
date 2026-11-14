import { describe, expect, it } from 'vitest'
import { parseRecoveries, summarizeRecoveries } from '../../../src/helpers/shardRecovery'
import type { IndexRecovery } from '../../../src/types/shardRecovery'

const body: IndexRecovery = {
  logs: {
    shards: [
      {
        id: 0,
        type: 'PEER',
        stage: 'INDEX',
        primary: false,
        start_time_in_millis: 2000,
        total_time_in_millis: 60_000,
        source: { name: 'node-1', host: '10.0.0.1' },
        target: { name: 'node-2', host: '10.0.0.2' },
        index: {
          size: { total_in_bytes: 1000, recovered_in_bytes: 250, percent: '25.0%' },
          files: { total: 10, recovered: 2, percent: '20.0%' },
          source_throttle_time_in_millis: 300,
          target_throttle_time_in_millis: 200
        },
        translog: { recovered: 0, total: 5, percent: '0.0%' }
      },
      {
        id: 1,
        type: 'EXISTING_STORE',
        stage: 'DONE',
        primary: true,
        start_time_in_millis: 1000,
        stop_time_in_millis: 1500,
        total_time_in_millis: 500,
        source: {},
        target: { name: 'node-1' },
        index: { size: { total_in_bytes: 500, recovered_in_bytes: 500, percent: '100.0%' } }
      }
    ]
  }
}

describe('parseRecoveries', () => {
  it('flattens shards and puts active recoveries first', () => {
    const [active, done] = parseRecoveries(body)
    expect(active).toMatchObject({
      index: 'logs',
      shard: 0,
      type: 'peer',
      stage: 'INDEX',
      active: true,
      sourceNode: 'node-1',
      targetNode: 'node-2',
      bytesPercent: 25,
      filesPercent: 20,
      translogPercent: 0,
      throttleMs: 500,
      stopTime: null
    })
    expect(done).toMatchObject({ active: false, sourceNode: null, translogPercent: null, throttleMs: 0 })
  })

  it('tolerates the sparse ES 1.x format', () => {
    const legacy = { old: { shards: [{ id: 0, type: 'GATEWAY', stage: 'DONE', translog: { recovered: 3 } }] } }
    expect(parseRecoveries(legacy as IndexRecovery)[0]).toMatchObject({
      type: 'gateway',
      active: false,
      bytesPercent: null,
      translogRecovered: 3,
      translogTotal: null,
      startTime: null
    })
  })

  it('has no percentage when there was nothing to copy', () => {
    const empty = {
      idx: {
        shards: [{ id: 0, stage: 'DONE', index: { size: { total_in_bytes: 0, recovered_in_bytes: 0, percent: '0.0%' } } }]
      }
    }
    expect(parseRecoveries(empty)[0].bytesPercent).toBeNull()
  })

  it('returns nothing without a body', () => {
    expect(parseRecoveries(null)).toEqual([])
  })
})

describe('summarizeRecoveries', () => {
  it('aggregates active recoveries', () => {
    expect(summarizeRecoveries(parseRecoveries(body))).toMatchObject({
      active: 1,
      completed: 1,
      activeTypes: [{ type: 'peer', count: 1 }],
      bytesTotal: 1000,
      bytesRecovered: 250,
      percent: 25,
      longest: { index: 'logs', shard: 0 },
      throttleMs: 500
    })
  })
})
