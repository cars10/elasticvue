import { describe, expect, it } from 'vitest'
import { formatTime, formatTimeAgo, formatTimeIn } from '../../../src/helpers/time'

const MINUTE = 60 * 1000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

describe('formatTime', () => {
  it('formats durations', () => {
    expect(formatTime(0)).toBe('0s')
    expect(formatTime(HOUR + 2 * MINUTE + 3000)).toBe('1h 2m 3s')
  })
})

describe('formatTimeAgo', () => {
  const now = 10 * DAY

  it('uses the largest unit', () => {
    expect(formatTimeAgo(now - 30 * 1000, now)).toBe('just now')
    expect(formatTimeAgo(now - 5 * MINUTE, now)).toBe('5m ago')
    expect(formatTimeAgo(now - 3 * HOUR - 10 * MINUTE, now)).toBe('3h ago')
    expect(formatTimeAgo(now - 2 * DAY - 5 * HOUR, now)).toBe('2d ago')
  })
})

describe('formatTimeIn', () => {
  const now = 10 * DAY

  it('formats future times', () => {
    expect(formatTimeIn(now + 10 * 1000, now)).toBe('now')
    expect(formatTimeIn(now + 3 * HOUR, now)).toBe('in 3h')
  })
})
