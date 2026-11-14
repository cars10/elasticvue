import { describe, expect, it } from 'vitest'
import { HOME_INDEX_PARAMS, HOME_TABLE_LIMIT, parseCatIndices } from '../../../src/helpers/homeDashboard'

const row = (index: string, size: number, health = 'green') => ({
  index,
  health,
  'docs.count': '1',
  'store.size': String(size),
  pri: '1',
  rep: '1'
})

describe('helpers/homeDashboard.ts', () => {
  describe('parseCatIndices', () => {
    it('does not rely on server side sorting', () => {
      expect('s' in HOME_INDEX_PARAMS).toBe(false)
    })

    it('returns the largest indices first regardless of the response order', () => {
      const rows = [row('small', 10), row('large', 3000), row('medium', 200)]

      expect(parseCatIndices(rows).indices.map((index) => index.index)).toEqual(['large', 'medium', 'small'])
    })

    it('lists unhealthy indices before larger healthy ones', () => {
      const rows = [row('large', 3000), row('broken', 5, 'red'), row('degraded', 50, 'yellow')]
      const parsed = parseCatIndices(rows)

      expect(parsed.indices.map((index) => index.index)).toEqual(['degraded', 'broken', 'large'])
      expect(parsed.unhealthy).toEqual({ red: ['broken'], yellow: ['degraded'] })
    })

    it('skips system indices and limits the table', () => {
      const rows = [row('.kibana', 9999), ...Array.from({ length: 8 }, (_, i) => row(`index-${i}`, i))]
      const parsed = parseCatIndices(rows)

      expect(parsed.eligibleCount).toBe(8)
      expect(parsed.indices).toHaveLength(HOME_TABLE_LIMIT)
      expect(parsed.indices[0].index).toBe('index-7')
    })

    it('handles an empty or missing response', () => {
      expect(parseCatIndices(null)).toEqual({ indices: [], eligibleCount: 0, unhealthy: { red: [], yellow: [] } })
    })
  })
})
