import { describe, expect, it } from 'vitest'
import {
  dateFields,
  histogramAggregation,
  histogramInterval,
  parseTime,
  presetOf,
  presetRange,
  timeFieldFor
} from '../../../src/helpers/search/timeRange'
import type { FieldCatalog } from '../../../src/types/search'

const field = (name: string, types: string[]) => ({
  name,
  types,
  indices: null,
  partial: false,
  aggregatable: true,
  sortField: name
})

const catalog: FieldCatalog = {
  created: field('created', ['date']),
  '@timestamp': field('@timestamp', ['date_nanos']),
  mixed: field('mixed', ['date', 'keyword']),
  title: field('title', ['text'])
}

const NOW = Date.parse('2024-06-01T12:00:00.000Z')

describe('parseTime', () => {
  it('parses relative and absolute times', () => {
    expect(parseTime('now', NOW)).toBe(NOW)
    expect(parseTime('now-15m', NOW)).toBe(NOW - 15 * 60_000)
    expect(parseTime('now-7d', NOW)).toBe(NOW - 7 * 86_400_000)
    expect(parseTime('2024-01-01T00:00:00.000Z', NOW)).toBe(Date.parse('2024-01-01T00:00:00.000Z'))
  })

  it('rejects unsupported values', () => {
    expect(parseTime('now+1d', NOW)).toBeNull()
    expect(parseTime('now-1y', NOW)).toBeNull()
    expect(parseTime('yesterday', NOW)).toBeNull()
  })
})

describe('presets', () => {
  it('round trips relative ranges', () => {
    expect(presetRange('4h')).toEqual({ from: 'now-4h', to: 'now' })
    expect(presetOf(presetRange('4h'))).toBe('4h')
    expect(presetOf({ from: '2024-01-01T00:00:00.000Z', to: 'now' })).toBeNull()
  })
})

describe('histogramInterval', () => {
  it('picks the smallest interval with at most 60 buckets', () => {
    expect(histogramInterval(NOW - 15 * 60_000, NOW)).toBe('30s')
    expect(histogramInterval(NOW - 3_600_000, NOW)).toBe('1m')
    expect(histogramInterval(NOW - 24 * 3_600_000, NOW)).toBe('30m')
    expect(histogramInterval(NOW - 30 * 86_400_000, NOW)).toBe('12h')
    expect(histogramInterval(0, NOW)).toBe('365d')
  })
})

describe('histogramAggregation', () => {
  const bounds = { min: NOW - 3_600_000, max: NOW }

  it('uses fixed_interval or interval depending on the version', () => {
    expect(histogramAggregation('ts', bounds, { fixedInterval: true }).aggregation).toEqual({
      date_histogram: { field: 'ts', fixed_interval: '1m', min_doc_count: 0, extended_bounds: bounds }
    })
    expect(histogramAggregation('ts', bounds, { fixedInterval: false }).aggregation.date_histogram).toHaveProperty(
      'interval',
      '1m'
    )
  })
})

describe('time fields', () => {
  it('only lists fields that are dates in every index', () => {
    expect(dateFields(catalog)).toEqual(['@timestamp', 'created'])
  })

  it('prefers the chosen field, then @timestamp, then the first date field', () => {
    expect(timeFieldFor(catalog, 'created')).toBe('created')
    expect(timeFieldFor(catalog, 'title')).toBe('@timestamp')
    expect(timeFieldFor({ created: catalog.created, title: catalog.title })).toBe('created')
    expect(timeFieldFor({ title: catalog.title })).toBeNull()
  })
})
