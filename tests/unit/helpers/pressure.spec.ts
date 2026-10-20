import { describe, expect, it } from 'vitest'
import { DEFAULT_DISK_WATERMARKS } from '../../../src/helpers/nodeStats'
import { diskThresholds, formatPercent, pressureLevel } from '../../../src/helpers/pressure'

describe('pressureLevel', () => {
  const thresholds = { warn: 75, danger: 85 }

  it('classifies values against thresholds', () => {
    expect(pressureLevel(50, thresholds)).toBeNull()
    expect(pressureLevel(75, thresholds)).toBe('warn')
    expect(pressureLevel(85, thresholds)).toBe('danger')
  })

  it('returns null without a value or thresholds', () => {
    expect(pressureLevel(null, thresholds)).toBeNull()
    expect(pressureLevel(99)).toBeNull()
  })
})

describe('diskThresholds', () => {
  it('uses low and high watermarks', () => {
    expect(diskThresholds({ ...DEFAULT_DISK_WATERMARKS, lowPercent: 70, highPercent: 80 })).toEqual({
      warn: 70,
      danger: 80
    })
  })

  it('falls back to defaults for byte-based watermarks', () => {
    expect(diskThresholds({ ...DEFAULT_DISK_WATERMARKS, lowPercent: null, highPercent: null })).toEqual({
      warn: 85,
      danger: 90
    })
  })
})

describe('formatPercent', () => {
  it('rounds and handles missing values', () => {
    expect(formatPercent(42.6)).toBe('43%')
    expect(formatPercent(null)).toBe('—')
  })
})
