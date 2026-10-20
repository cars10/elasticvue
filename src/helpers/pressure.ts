import type { DiskWatermarks } from '../types/homeDashboard.ts'

/** Percent at which a resource metric turns yellow (warn) or red (danger). */
export type Thresholds = { warn: number; danger: number }

export type PressureLevel = 'warn' | 'danger' | null

export const CPU_THRESHOLDS: Thresholds = { warn: 80, danger: 90 }
export const HEAP_THRESHOLDS: Thresholds = { warn: 75, danger: 85 }
/** Fallback when the cluster's disk watermarks are unknown; matches the Elasticsearch defaults. */
export const DISK_THRESHOLDS: Thresholds = { warn: 85, danger: 90 }

/** Disk warns at the low watermark and is critical at the high one, where shards start moving away. */
export const diskThresholds = (watermarks?: DiskWatermarks | null): Thresholds => ({
  warn: watermarks?.lowPercent ?? DISK_THRESHOLDS.warn,
  danger: watermarks?.highPercent ?? DISK_THRESHOLDS.danger
})

export const pressureLevel = (value?: number | null, thresholds?: Thresholds): PressureLevel => {
  if (value == null || Number.isNaN(value) || !thresholds) return null
  if (value >= thresholds.danger) return 'danger'
  if (value >= thresholds.warn) return 'warn'
  return null
}

export const pressureTextClass = (level: PressureLevel): string | undefined => {
  if (level === 'danger') return 'health--red'
  if (level === 'warn') return 'health--yellow'
  return undefined
}

export const pressureBarColor = (level: PressureLevel): string => {
  if (level === 'danger') return 'negative'
  if (level === 'warn') return 'warning'
  return 'primary'
}

export const formatPercent = (value?: number | null): string => {
  if (value == null || Number.isNaN(value)) return '—'
  return `${Math.round(value)}%`
}
