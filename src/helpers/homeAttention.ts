import { flatClusterSettings } from './nodeStats.ts'
import type {
  AllocationEnable,
  AttentionCheck,
  AttentionFinding,
  ClusterHealth,
  ClusterStats,
  DiskWatermarks,
  HeapSample,
  IndexBlock,
  OverviewNode,
  PendingTaskInfo,
  PressureSample
} from '../types/homeDashboard.ts'

const PRESSURE_WINDOW_MS = 5 * 60 * 1000
const HEAP_SUSTAINED_MS = 2 * 60 * 1000
const HEAP_PRESSURE_PERCENT = 85
const FD_WARN_PERCENT = 90
/** Only investigate pending-task age when health reports at least this many. */
export const PENDING_TASKS_FETCH_THRESHOLD = 5
/** Alert when oldest pending task exceeds this age. */
export const PENDING_TASK_AGE_MS = 30_000

const SEVERITY_RANK: Record<AttentionFinding['severity'], number> = {
  critical: 0,
  warning: 1,
  info: 2
}

/** Lower = higher priority within the same severity (availability before capacity). */
const FINDING_PRIORITY: Record<string, number> = {
  'unassigned-primaries': 0,
  'index-blocks': 1,
  'disk-flood': 2,
  'allocation-disabled': 3,
  'unassigned-replicas': 4,
  'disk-watermark': 5,
  'pending-tasks': 6,
  rejections: 7,
  breakers: 8,
  'jvm-pressure': 9,
  'file-descriptors': 10,
  'mixed-versions': 11,
  monitoring: 12
}

export type AttentionDetectorInput = {
  health: ClusterHealth | null
  stats: ClusterStats | null
  nodes: OverviewNode[]
  unhealthyIndices: { red: string[]; yellow: string[] }
  diskWatermarks: DiskWatermarks
  allocationEnable: AllocationEnable
  indexBlocks: IndexBlock[]
  pendingTasks: PendingTaskInfo | null
  pressureSamples: PressureSample[]
  heapSamples: HeapSample[]
  nodesMonitoringAvailable: boolean | null
  now?: number
}

export type Translate = (key: string, named?: Record<string, unknown>, plural?: number) => string

const actions = (t: Translate) => ({
  shards: { label: t('home.attention.actions.view_shards'), route: 'shards' },
  nodes: { label: t('home.attention.actions.view_nodes'), route: 'nodes' },
  indices: { label: t('home.attention.actions.view_indices'), route: 'indices' }
})

const formatDuration = (ms: number): string => {
  if (ms < 1000) return `${Math.round(ms)}ms`
  const sec = Math.round(ms / 1000)
  if (sec < 60) return `${sec}s`
  const min = Math.floor(sec / 60)
  const rem = sec % 60
  return rem > 0 ? `${min}m ${rem}s` : `${min}m`
}

const dataNodeCount = (health: ClusterHealth | null, stats: ClusterStats | null): number | null => {
  if (health?.number_of_data_nodes != null) return health.number_of_data_nodes
  if (stats?.nodes.count.data != null) return stats.nodes.count.data
  if (stats?.nodes.count.total != null) return stats.nodes.count.total
  return null
}

const primariesSummary = (t: Translate, count: number, names: string[]) => {
  if (names.length === 1)
    return t('home.attention.findings.unassigned_primaries.summary_index', { count, index: names[0] }, count)
  if (names.length > 1) {
    return t('home.attention.findings.unassigned_primaries.summary_indices', { count, indices: names.length }, count)
  }
  return t('home.attention.findings.unassigned_primaries.summary', { count }, count)
}

const replicasSummary = (t: Translate, count: number, names: string[], singleNode: boolean) => {
  const index = names[0]
  if (singleNode) {
    return names.length === 1
      ? t('home.attention.findings.unassigned_replicas.summary_single_node_index', { count, index }, count)
      : t('home.attention.findings.unassigned_replicas.summary_single_node', { count }, count)
  }
  if (names.length === 1) return t('home.attention.findings.unassigned_replicas.summary_index', { count, index }, count)
  if (names.length > 1) {
    return t('home.attention.findings.unassigned_replicas.summary_indices', { count, indices: names.length }, count)
  }
  return t('home.attention.findings.unassigned_replicas.summary', { count }, count)
}

export const detectShardProblems = (t: Translate, input: AttentionDetectorInput): AttentionFinding[] => {
  const { health, stats, unhealthyIndices } = input
  if (!health) return []

  const unassigned = health.unassigned_shards || 0
  if (unassigned <= 0) return []

  const names = [...unhealthyIndices.red, ...unhealthyIndices.yellow]
  const entity = names.length ? { type: 'index' as const, name: names[0] } : { type: 'cluster' as const, name: 'cluster' }
  const findings: AttentionFinding[] = []
  const primary = {
    id: 'unassigned-primaries',
    severity: 'critical' as const,
    title: t('home.attention.findings.unassigned_primaries.title'),
    detail: t('home.attention.findings.unassigned_primaries.detail'),
    entity,
    action: actions(t).shards
  }

  if (health.unassigned_primary_shards == null && (health.status || '').toLowerCase() === 'red') {
    return [{ ...primary, summary: t('home.attention.findings.unassigned_primaries.summary_unknown') }]
  }

  const primaries = health.unassigned_primary_shards ?? 0
  const replicas = Math.max(0, unassigned - primaries)

  if (primaries > 0) findings.push({ ...primary, summary: primariesSummary(t, primaries, names) })

  if (replicas > 0) {
    const dataNodes = dataNodeCount(health, stats)
    const singleNode = dataNodes != null && dataNodes <= 1

    findings.push({
      id: 'unassigned-replicas',
      severity: 'warning',
      title: t('home.attention.findings.unassigned_replicas.title'),
      summary: replicasSummary(t, replicas, names, singleNode),
      detail: singleNode
        ? t('home.attention.findings.unassigned_replicas.detail_single_node')
        : t('home.attention.findings.unassigned_replicas.detail'),
      entity,
      action: actions(t).shards
    })
  }

  return findings
}

export const detectIndexBlocks = (t: Translate, blocks: IndexBlock[]): AttentionFinding[] => {
  if (!blocks.length) return []

  const readOnly = blocks.filter((block) => block.kinds.some((kind) => kind.startsWith('read_only')))
  const allowDelete = blocks.some((block) => block.kinds.includes('read_only_allow_delete'))
  const index = (readOnly[0] || blocks[0]).index

  let summary = t('home.attention.findings.index_blocks.summary_many', { count: blocks.length, index })
  if (blocks.length === 1) {
    summary = readOnly.length
      ? t('home.attention.findings.index_blocks.summary_read_only', { index })
      : t('home.attention.findings.index_blocks.summary_write', { index })
  }

  return [
    {
      id: 'index-blocks',
      severity: readOnly.length ? 'critical' : 'warning',
      title: readOnly.length
        ? t('home.attention.findings.index_blocks.title_read_only')
        : t('home.attention.findings.index_blocks.title_write'),
      summary,
      detail: allowDelete
        ? t('home.attention.findings.index_blocks.detail_allow_delete')
        : t('home.attention.findings.index_blocks.detail'),
      entity: { type: 'index', name: index },
      action: actions(t).indices
    }
  ]
}

export const detectDiskProblems = (t: Translate, nodes: OverviewNode[], watermarks: DiskWatermarks): AttentionFinding[] => {
  const findings: AttentionFinding[] = []

  for (const node of nodes) {
    const used = node.diskPercent
    if (used == null) continue

    const params = { node: node.name, percent: Math.round(used) }
    const base = { entity: { type: 'node' as const, name: node.name }, action: actions(t).nodes }

    if (watermarks.floodPercent != null && used >= watermarks.floodPercent) {
      findings.push({
        ...base,
        id: `disk-flood:${node.name}`,
        severity: 'critical',
        title: t('home.attention.findings.disk_flood.title'),
        summary: t('home.attention.findings.disk_flood.summary', { ...params, threshold: watermarks.flood }),
        detail: t('home.attention.findings.disk_flood.detail')
      })
    } else if (watermarks.highPercent != null && used >= watermarks.highPercent) {
      findings.push({
        ...base,
        id: `disk-watermark:${node.name}`,
        severity: 'warning',
        title: t('home.attention.findings.disk_high.title'),
        summary: t('home.attention.findings.disk_high.summary', { ...params, threshold: watermarks.high }),
        detail: t('home.attention.findings.disk_high.detail')
      })
    } else if (watermarks.lowPercent != null && used >= watermarks.lowPercent) {
      findings.push({
        ...base,
        id: `disk-watermark:${node.name}`,
        severity: 'warning',
        title: t('home.attention.findings.disk_low.title'),
        summary: t('home.attention.findings.disk_low.summary', { ...params, threshold: watermarks.low }),
        detail: t('home.attention.findings.disk_low.detail')
      })
    }
  }

  return findings
}

export const detectAllocationSettings = (t: Translate, allocationEnable: AllocationEnable): AttentionFinding[] => {
  const value = (allocationEnable || 'all').toLowerCase()
  if (value === 'all') return []

  const summaries: Record<string, string> = {
    none: t('home.attention.findings.allocation.summary_none'),
    primaries: t('home.attention.findings.allocation.summary_primaries'),
    new_primaries: t('home.attention.findings.allocation.summary_new_primaries')
  }

  return [
    {
      id: 'allocation-disabled',
      severity: 'warning',
      title: t('home.attention.findings.allocation.title'),
      summary: summaries[value] || t('home.attention.findings.allocation.summary_other', { value }),
      detail: t('home.attention.findings.allocation.detail'),
      entity: { type: 'cluster', name: 'cluster' },
      action: actions(t).shards
    }
  ]
}

export const detectPendingTasks = (t: Translate, pending: PendingTaskInfo | null): AttentionFinding[] => {
  if (!pending || pending.count <= 0) return []
  if (pending.oldestAgeMs == null) return []
  if (pending.oldestAgeMs < PENDING_TASK_AGE_MS) return []

  return [
    {
      id: 'pending-tasks',
      severity: 'warning',
      title: t('home.attention.findings.pending_tasks.title'),
      summary: t('home.attention.findings.pending_tasks.summary', {
        count: pending.count,
        age: formatDuration(pending.oldestAgeMs)
      }),
      detail: t('home.attention.findings.pending_tasks.detail'),
      entity: { type: 'cluster', name: 'cluster' }
    }
  ]
}

const recentTotal = (samples: PressureSample[], now: number, field: 'rejectedDelta' | 'breakerDelta') => {
  const windowStart = now - PRESSURE_WINDOW_MS
  return samples.filter((s) => s.at >= windowStart).reduce((sum, s) => sum + s[field], 0)
}

export const detectRecentRejections = (t: Translate, samples: PressureSample[], now: number): AttentionFinding[] => {
  const count = recentTotal(samples, now, 'rejectedDelta')
  if (count <= 0) return []

  return [
    {
      id: 'rejections',
      severity: 'warning',
      title: t('home.attention.findings.rejections.title'),
      summary: t('home.attention.findings.rejections.summary', { count }, count),
      detail: t('home.attention.findings.rejections.detail'),
      entity: { type: 'cluster', name: 'cluster' },
      action: actions(t).nodes
    }
  ]
}

export const detectRecentBreakerTrips = (t: Translate, samples: PressureSample[], now: number): AttentionFinding[] => {
  const count = recentTotal(samples, now, 'breakerDelta')
  if (count <= 0) return []

  return [
    {
      id: 'breakers',
      severity: 'warning',
      title: t('home.attention.findings.breakers.title'),
      summary: t('home.attention.findings.breakers.summary', { count }, count),
      detail: t('home.attention.findings.breakers.detail'),
      entity: { type: 'cluster', name: 'cluster' },
      action: actions(t).nodes
    }
  ]
}

export const detectJvmPressure = (t: Translate, samples: HeapSample[], now: number): AttentionFinding[] => {
  if (samples.length < 2) return []

  const byNode = new Map<string, HeapSample[]>()
  for (const sample of samples) {
    const list = byNode.get(sample.node) || []
    list.push(sample)
    byNode.set(sample.node, list)
  }

  const findings: AttentionFinding[] = []

  for (const [node, nodeSamples] of byNode) {
    const sorted = [...nodeSamples].sort((a, b) => a.at - b.at)
    // Walk backwards while heap stays above threshold
    let sustainedFrom: number | null = null
    for (let i = sorted.length - 1; i >= 0; i--) {
      if (sorted[i].heapPercent < HEAP_PRESSURE_PERCENT) break
      sustainedFrom = sorted[i].at
    }
    if (sustainedFrom == null) continue

    const duration = now - sustainedFrom
    if (duration < HEAP_SUSTAINED_MS) continue

    const latest = sorted[sorted.length - 1]
    findings.push({
      id: `jvm-pressure:${node}`,
      severity: 'warning',
      title: t('home.attention.findings.jvm.title'),
      summary: t('home.attention.findings.jvm.summary', {
        node,
        threshold: HEAP_PRESSURE_PERCENT,
        duration: formatDuration(duration)
      }),
      detail: t('home.attention.findings.jvm.detail', { percent: Math.round(latest.heapPercent) }),
      entity: { type: 'node', name: node },
      action: actions(t).nodes
    })
  }

  return findings
}

export const detectFileDescriptorPressure = (t: Translate, nodes: OverviewNode[]): AttentionFinding[] => {
  const findings: AttentionFinding[] = []

  for (const node of nodes) {
    const percent = node.fileDescriptorPercent
    if (percent == null || percent < FD_WARN_PERCENT) continue

    const params = { node: node.name, percent: Math.round(percent) }

    findings.push({
      id: `file-descriptors:${node.name}`,
      severity: 'warning',
      title: t('home.attention.findings.file_descriptors.title'),
      summary:
        node.fileDescriptorsOpen != null && node.fileDescriptorsMax != null
          ? t('home.attention.findings.file_descriptors.summary_counts', {
              ...params,
              open: node.fileDescriptorsOpen,
              max: node.fileDescriptorsMax
            })
          : t('home.attention.findings.file_descriptors.summary', params),
      detail: t('home.attention.findings.file_descriptors.detail'),
      entity: { type: 'node', name: node.name },
      action: actions(t).nodes
    })
  }

  return findings
}

export const detectVersionMismatch = (t: Translate, stats: ClusterStats | null): AttentionFinding[] => {
  const versions = stats?.nodes.versions || []
  if (versions.length <= 1) return []

  return [
    {
      id: 'mixed-versions',
      severity: 'info',
      title: t('home.attention.findings.versions.title'),
      summary: t('home.attention.findings.versions.summary', { versions: versions.join(', ') }),
      detail: t('home.attention.findings.versions.detail'),
      entity: { type: 'cluster', name: 'cluster' },
      action: actions(t).nodes
    }
  ]
}

export const detectMonitoringProblems = (
  t: Translate,
  available: boolean | null,
  expectedNodes: number | null,
  observedNodes: number
): AttentionFinding[] => {
  if (available !== false) return []

  return [
    {
      id: 'monitoring',
      severity: 'info',
      title: t('home.attention.findings.monitoring.title'),
      summary:
        expectedNodes != null && expectedNodes > 0
          ? t('home.attention.findings.monitoring.summary_partial', { observed: observedNodes, expected: expectedNodes })
          : t('home.attention.findings.monitoring.summary'),
      detail: t('home.attention.findings.monitoring.detail'),
      entity: { type: 'cluster', name: 'cluster' }
    }
  ]
}

const sortFindings = (findings: AttentionFinding[]): AttentionFinding[] => {
  return [...findings].sort((a, b) => {
    const sev = SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]
    if (sev !== 0) return sev
    const aKey = a.id.split(':')[0]
    const bKey = b.id.split(':')[0]
    return (FINDING_PRIORITY[aKey] ?? 99) - (FINDING_PRIORITY[bKey] ?? 99)
  })
}

export const buildAttentionFindings = (t: Translate, input: AttentionDetectorInput): AttentionFinding[] => {
  const now = input.now ?? Date.now()

  const findings = [
    ...detectShardProblems(t, input),
    ...detectIndexBlocks(t, input.indexBlocks),
    ...detectDiskProblems(t, input.nodes, input.diskWatermarks),
    ...detectAllocationSettings(t, input.allocationEnable),
    ...detectPendingTasks(t, input.pendingTasks),
    ...detectRecentRejections(t, input.pressureSamples, now),
    ...detectRecentBreakerTrips(t, input.pressureSamples, now),
    ...detectJvmPressure(t, input.heapSamples, now),
    ...detectFileDescriptorPressure(t, input.nodes),
    ...detectVersionMismatch(t, input.stats),
    ...detectMonitoringProblems(
      t,
      input.nodesMonitoringAvailable,
      input.stats?.nodes.count.total ?? input.health?.number_of_nodes ?? null,
      input.nodes.length
    )
  ]

  return sortFindings(findings)
}

/** Stable expanded checklist — one row per concern area, OK when no finding. */
const checkDefinitions = (t: Translate) => [
  {
    id: 'shards',
    title: t('home.attention.checks.shards.title'),
    ok: t('home.attention.checks.shards.ok'),
    prefixes: ['unassigned-primaries', 'unassigned-replicas']
  },
  {
    id: 'index-blocks',
    title: t('home.attention.checks.index_blocks.title'),
    ok: t('home.attention.checks.index_blocks.ok'),
    prefixes: ['index-blocks']
  },
  {
    id: 'allocation',
    title: t('home.attention.checks.allocation.title'),
    ok: t('home.attention.checks.allocation.ok'),
    prefixes: ['allocation-disabled']
  },
  {
    id: 'pending-tasks',
    title: t('home.attention.checks.pending_tasks.title'),
    ok: t('home.attention.checks.pending_tasks.ok'),
    prefixes: ['pending-tasks']
  },
  {
    id: 'disk',
    title: t('home.attention.checks.disk.title'),
    ok: t('home.attention.checks.disk.ok'),
    prefixes: ['disk-flood', 'disk-watermark']
  },
  {
    id: 'rejections',
    title: t('home.attention.checks.rejections.title'),
    ok: t('home.attention.checks.rejections.ok'),
    prefixes: ['rejections']
  },
  {
    id: 'breakers',
    title: t('home.attention.checks.breakers.title'),
    ok: t('home.attention.checks.breakers.ok'),
    prefixes: ['breakers']
  },
  {
    id: 'jvm',
    title: t('home.attention.checks.jvm.title'),
    ok: t('home.attention.checks.jvm.ok'),
    prefixes: ['jvm-pressure']
  },
  {
    id: 'file-descriptors',
    title: t('home.attention.checks.file_descriptors.title'),
    ok: t('home.attention.checks.file_descriptors.ok'),
    prefixes: ['file-descriptors']
  },
  {
    id: 'versions',
    title: t('home.attention.checks.versions.title'),
    ok: t('home.attention.checks.versions.ok'),
    prefixes: ['mixed-versions']
  },
  {
    id: 'monitoring',
    title: t('home.attention.checks.monitoring.title'),
    ok: t('home.attention.checks.monitoring.ok'),
    prefixes: ['monitoring']
  }
]

const worstSeverity = (findings: AttentionFinding[]): AttentionFinding['severity'] => {
  if (findings.some((f) => f.severity === 'critical')) return 'critical'
  if (findings.some((f) => f.severity === 'warning')) return 'warning'
  return 'info'
}

/**
 * Always returns every check row for the expanded Attention card.
 * Findings fold into their check; otherwise the row is OK.
 */
export const buildAttentionChecks = (t: Translate, input: AttentionDetectorInput): AttentionCheck[] => {
  const findings = buildAttentionFindings(t, input)

  return checkDefinitions(t).map((def) => {
    const matched = findings.filter((f) => def.prefixes.includes(f.id.split(':')[0]))
    if (!matched.length) return { id: def.id, title: def.title, severity: 'ok', summary: [def.ok], detail: [] }

    return {
      id: def.id,
      title: matched.length === 1 ? matched[0].title : def.title,
      severity: worstSeverity(matched),
      summary: matched.map((f) => f.summary),
      detail: [...new Set(matched.map((f) => f.detail).filter((d): d is string => Boolean(d)))],
      action: matched[0].action
    }
  })
}

export const parseAllocationEnable = (settings: Parameters<typeof flatClusterSettings>[0]): AllocationEnable => {
  if (!settings) return 'all'
  const { persistent, transient, defaults } = flatClusterSettings(settings)
  const value =
    transient['cluster.routing.allocation.enable'] ??
    persistent['cluster.routing.allocation.enable'] ??
    defaults['cluster.routing.allocation.enable'] ??
    'all'
  return String(value)
}

/** Parse `_cluster/state/blocks` into actionable index blocks. */
export const parseIndexBlocks = (
  body: {
    blocks?: {
      indices?: Record<string, Record<string, { description?: string; levels?: string[] }>>
    }
  } | null
): IndexBlock[] => {
  const indices = body?.blocks?.indices
  if (!indices) return []

  const results: IndexBlock[] = []

  for (const [index, blocks] of Object.entries(indices)) {
    if (index.startsWith('.')) continue
    const kinds = new Set<string>()

    for (const block of Object.values(blocks || {})) {
      const description = (block.description || '').toLowerCase()
      const levels = (block.levels || []).map((l) => l.toLowerCase())

      if (description === 'index closed') continue

      if (description.includes('read-only') && description.includes('allow delete')) {
        kinds.add('read_only_allow_delete')
      } else if (description.includes('read-only') || description.includes('read only')) {
        kinds.add('read_only')
      } else if (levels.includes('write')) {
        kinds.add('write')
      }
    }

    if (kinds.size > 0) {
      results.push({ index, kinds: [...kinds] })
    }
  }

  return results
}

export const parsePendingTasks = (body: unknown): PendingTaskInfo => {
  const tasks = Array.isArray(body) ? body : (body as { tasks?: unknown[] })?.tasks
  if (!Array.isArray(tasks) || tasks.length === 0) {
    return { count: 0, oldestAgeMs: null }
  }

  let oldest: number | null = null
  for (const task of tasks) {
    const age =
      typeof task === 'object' && task != null
        ? ((task as { time_in_queue_millis?: number; time_in_queue?: string }).time_in_queue_millis ?? null)
        : null
    if (age == null) continue
    if (oldest == null || age > oldest) oldest = age
  }

  return { count: tasks.length, oldestAgeMs: oldest }
}

export const trimPressureSamples = (samples: PressureSample[], now: number): PressureSample[] => {
  const windowStart = now - PRESSURE_WINDOW_MS
  return samples.filter((s) => s.at >= windowStart)
}

export const trimHeapSamples = (samples: HeapSample[], now: number): HeapSample[] => {
  // Keep a bit more than the sustain window so we can detect duration
  const windowStart = now - HEAP_SUSTAINED_MS * 3
  return samples.filter((s) => s.at >= windowStart)
}
