import type { FieldCatalog, SearchTimeBounds } from '../../types/search.ts'

export const TIME_PRESETS = ['15m', '1h', '4h', '24h', '7d', '30d']
export const HISTOGRAM_BUCKETS = 60

const UNIT_MS: Record<string, number> = {
  s: 1000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
  w: 604_800_000
}

const INTERVALS = ['1s', '5s', '10s', '30s', '1m', '5m', '10m', '30m', '1h', '3h', '6h', '12h', '1d', '7d', '30d', '365d']

export const durationMs = (duration: string) => {
  const match = duration.match(/^(\d+)([smhdw])$/)
  return match ? parseInt(match[1]) * UNIT_MS[match[2]] : null
}

export const presetRange = (preset: string): SearchTimeBounds => ({ from: `now-${preset}`, to: 'now' })

export const presetOf = ({ from, to }: SearchTimeBounds) => {
  const match = from.match(/^now-(\d+[smhdw])$/)
  return to === 'now' && match ? match[1] : null
}

export const parseTime = (value: string, now = Date.now()): number | null => {
  if (value === 'now') return now
  if (value.startsWith('now')) {
    const offset = durationMs(value.slice(4))
    return value[3] === '-' && offset ? now - offset : null
  }
  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? null : parsed
}

export const histogramInterval = (from: number, to: number, buckets = HISTOGRAM_BUCKETS) =>
  INTERVALS.find((interval) => (to - from) / durationMs(interval)! <= buckets) ?? INTERVALS[INTERVALS.length - 1]

export const histogramAggregation = (
  field: string,
  bounds: { min: number; max: number },
  { fixedInterval }: { fixedInterval: boolean }
) => {
  const interval = histogramInterval(bounds.min, bounds.max)
  return {
    interval,
    aggregation: {
      date_histogram: {
        field,
        [fixedInterval ? 'fixed_interval' : 'interval']: interval,
        min_doc_count: 0,
        extended_bounds: bounds
      }
    }
  }
}

const DATE_TYPES = ['date', 'date_nanos']

export const dateFields = (catalog: FieldCatalog) =>
  Object.values(catalog)
    .filter((field) => field.types.length > 0 && field.types.every((type) => DATE_TYPES.includes(type)))
    .map((field) => field.name)
    .sort()

export const timeFieldFor = (catalog: FieldCatalog, preferred?: string) => {
  const fields = dateFields(catalog)
  if (preferred && fields.includes(preferred)) return preferred
  if (fields.includes('@timestamp')) return '@timestamp'
  return fields[0] ?? null
}
