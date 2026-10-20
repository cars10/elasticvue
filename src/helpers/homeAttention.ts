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

const unassignedPrimaries = (health: ClusterHealth | null): number => {
  if (!health) return 0
  if (health.unassigned_primary_shards != null) return health.unassigned_primary_shards
  // Pre-8.16: red + unassigned usually means primaries (best-effort)
  const status = (health.status || '').toLowerCase()
  if (status === 'red' && (health.unassigned_shards || 0) > 0) return health.unassigned_shards
  return 0
}

const affectedIndexLabel = (unhealthy: { red: string[]; yellow: string[] }): { name: string | null; count: number } => {
  const names = [...unhealthy.red, ...unhealthy.yellow]
  if (names.length === 0) return { name: null, count: 0 }
  if (names.length === 1) return { name: names[0], count: 1 }
  return { name: names[0], count: names.length }
}

export const detectShardProblems = (input: AttentionDetectorInput): AttentionFinding[] => {
  const { health, stats, unhealthyIndices } = input
  if (!health) return []

  const unassigned = health.unassigned_shards || 0
  if (unassigned <= 0) return []

  const primaries = unassignedPrimaries(health)
  const replicas = Math.max(0, unassigned - primaries)
  const findings: AttentionFinding[] = []
  const { name: indexName, count: indexCount } = affectedIndexLabel(unhealthyIndices)

  if (primaries > 0) {
    const indexPart = indexName ? (indexCount === 1 ? ` on ${indexName}` : ` across ${indexCount} indices`) : ''
    findings.push({
      id: 'unassigned-primaries',
      severity: 'critical',
      title: 'Primary shards unassigned',
      summary: `${primaries} primary shards are unassigned${indexPart}`,
      detail: 'Some data may be unavailable until primaries are allocated.',
      entity: indexName ? { type: 'index', name: indexName } : { type: 'cluster', name: 'cluster' },
      action: { label: 'View shards', route: 'shards' }
    })
  }

  if (replicas > 0) {
    const dataNodes = dataNodeCount(health, stats)
    const singleNode = dataNodes != null && dataNodes <= 1

    let summary: string
    let detail: string

    if (singleNode) {
      summary =
        indexName && indexCount === 1
          ? `${replicas} replicas on ${indexName} cannot be allocated`
          : `${replicas} replica shards cannot be allocated`
      detail = 'Replicas cannot be allocated because this cluster has only one eligible data node.'
    } else if (indexName && indexCount === 1) {
      summary = `${replicas} replica shards are unassigned on ${indexName}`
      detail = 'Data is available, but redundancy is reduced.'
    } else if (indexCount > 1) {
      summary = `${replicas} replica shards are unassigned across ${indexCount} indices`
      detail = 'Data is available, but redundancy is reduced.'
    } else {
      summary = `${replicas} replica shards are unassigned`
      detail = 'Data is available, but redundancy is reduced.'
    }

    findings.push({
      id: 'unassigned-replicas',
      severity: 'warning',
      title: 'Replica shards unassigned',
      summary,
      detail,
      entity: indexName ? { type: 'index', name: indexName } : { type: 'cluster', name: 'cluster' },
      action: { label: 'View shards', route: 'shards' }
    })
  }

  return findings
}

export const detectIndexBlocks = (blocks: IndexBlock[]): AttentionFinding[] => {
  return blocks.map((block) => {
    const kinds = block.kinds
    const readOnly = kinds.some((k) => k.includes('read_only'))
    const writeBlocked = kinds.some((k) => k === 'write' || k.includes('write') || k.includes('read_only'))

    let title = 'Index write blocked'
    let summary = `Index ${block.index} has write blocks`
    let detail = 'Indexing into this index is currently blocked.'
    let severity: AttentionFinding['severity'] = 'warning'

    if (readOnly) {
      title = 'Index is read-only'
      summary = `Index ${block.index} is read-only`
      detail = kinds.some((k) => k.includes('allow_delete'))
        ? 'Indexing is blocked (deletes may still be allowed). Often caused by disk flood-stage.'
        : 'Indexing into this index is currently blocked.'
      severity = 'critical'
    } else if (writeBlocked) {
      severity = 'critical'
    }

    return {
      id: `index-blocks:${block.index}`,
      severity,
      title,
      summary,
      detail,
      entity: { type: 'index', name: block.index },
      action: { label: 'View indices', route: 'indices' }
    }
  })
}

export const detectDiskProblems = (nodes: OverviewNode[], watermarks: DiskWatermarks): AttentionFinding[] => {
  const floodAt = watermarks.floodPercent
  const highAt = watermarks.highPercent
  const lowAt = watermarks.lowPercent
  const findings: AttentionFinding[] = []

  for (const node of nodes) {
    const used = node.diskPercent
    if (used == null) continue

    if (floodAt != null && used >= floodAt) {
      findings.push({
        id: `disk-flood:${node.name}`,
        severity: 'critical',
        title: 'Disk flood-stage exceeded',
        summary: `${node.name} at ${Math.round(used)}% used (flood ${watermarks.flood})`,
        detail: 'Elasticsearch may place affected indices into read-only mode.',
        entity: { type: 'node', name: node.name },
        action: { label: 'View nodes', route: 'nodes' }
      })
      continue
    }

    if (highAt != null && used >= highAt) {
      findings.push({
        id: `disk-watermark:${node.name}`,
        severity: 'warning',
        title: 'Disk high watermark exceeded',
        summary: `${node.name} at ${Math.round(used)}% used (high ${watermarks.high})`,
        detail: 'Shard allocation may be restricted on this node.',
        entity: { type: 'node', name: node.name },
        action: { label: 'View nodes', route: 'nodes' }
      })
      continue
    }

    if (lowAt != null && used >= lowAt) {
      findings.push({
        id: `disk-watermark:${node.name}`,
        severity: 'warning',
        title: 'Disk low watermark exceeded',
        summary: `${node.name} at ${Math.round(used)}% used (low ${watermarks.low})`,
        detail: 'New shards will not be allocated to this node.',
        entity: { type: 'node', name: node.name },
        action: { label: 'View nodes', route: 'nodes' }
      })
    }
  }

  return findings
}

export const detectAllocationSettings = (allocationEnable: AllocationEnable): AttentionFinding[] => {
  const value = (allocationEnable || 'all').toLowerCase()
  if (value === 'all') return []

  const labels: Record<string, string> = {
    none: 'Shard allocation is disabled',
    primaries: 'Only primary shard allocation is enabled',
    new_primaries: 'Only new primary shard allocation is enabled'
  }

  return [
    {
      id: 'allocation-disabled',
      severity: 'warning',
      title: 'Shard allocation restricted',
      summary: labels[value] || `Shard allocation is set to "${value}"`,
      detail: 'New and recovering shards may not be allocated. Often left on after maintenance.',
      entity: { type: 'cluster', name: 'cluster' },
      action: { label: 'View shards', route: 'shards' }
    }
  ]
}

export const detectPendingTasks = (pending: PendingTaskInfo | null): AttentionFinding[] => {
  if (!pending || pending.count <= 0) return []
  if (pending.oldestAgeMs == null) return []
  if (pending.oldestAgeMs < PENDING_TASK_AGE_MS) return []

  return [
    {
      id: 'pending-tasks',
      severity: 'warning',
      title: 'Cluster tasks are backing up',
      summary: `${pending.count} pending, oldest waiting ${formatDuration(pending.oldestAgeMs)}`,
      detail: 'Cluster state updates may be delayed.',
      entity: { type: 'cluster', name: 'cluster' }
    }
  ]
}

export const detectRecentRejections = (samples: PressureSample[], now: number): AttentionFinding[] => {
  const windowStart = now - PRESSURE_WINDOW_MS
  const recent = samples.filter((s) => s.at >= windowStart)
  const total = recent.reduce((sum, s) => sum + s.rejectedDelta, 0)
  if (total <= 0) return []

  return [
    {
      id: 'rejections',
      severity: 'warning',
      title: 'Search/indexing requests rejected',
      summary: `${total} new rejections in the last 5 minutes`,
      detail: 'Thread pools are saturated — requests are being dropped.',
      entity: { type: 'cluster', name: 'cluster' },
      action: { label: 'View nodes', route: 'nodes' }
    }
  ]
}

export const detectRecentBreakerTrips = (samples: PressureSample[], now: number): AttentionFinding[] => {
  const windowStart = now - PRESSURE_WINDOW_MS
  const recent = samples.filter((s) => s.at >= windowStart)
  const total = recent.reduce((sum, s) => sum + s.breakerDelta, 0)
  if (total <= 0) return []

  return [
    {
      id: 'breakers',
      severity: 'warning',
      title: 'Memory circuit breaker triggered',
      summary: `${total} new trips in the last 5 minutes`,
      detail: 'Queries or aggregations are hitting memory limits.',
      entity: { type: 'cluster', name: 'cluster' },
      action: { label: 'View nodes', route: 'nodes' }
    }
  ]
}

export const detectJvmPressure = (samples: HeapSample[], now: number): AttentionFinding[] => {
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
      title: 'High JVM memory pressure',
      summary: `${node} remained above ${HEAP_PRESSURE_PERCENT}% for ${formatDuration(duration)}`,
      detail: `Currently ${Math.round(latest.heapPercent)}% — sustained pressure often precedes GC instability.`,
      entity: { type: 'node', name: node },
      action: { label: 'View nodes', route: 'nodes' }
    })
  }

  return findings
}

export const detectFileDescriptorPressure = (nodes: OverviewNode[]): AttentionFinding[] => {
  const findings: AttentionFinding[] = []

  for (const node of nodes) {
    const pct = node.fileDescriptorPercent
    if (pct == null || pct < FD_WARN_PERCENT) continue

    const counts =
      node.fileDescriptorsOpen != null && node.fileDescriptorsMax != null
        ? ` (${node.fileDescriptorsOpen} / ${node.fileDescriptorsMax})`
        : ''

    findings.push({
      id: `file-descriptors:${node.name}`,
      severity: 'warning',
      title: 'File descriptor limit approaching',
      summary: `${node.name}: ${Math.round(pct)}% used${counts}`,
      detail: 'Exhausting file descriptors can cause node failures.',
      entity: { type: 'node', name: node.name },
      action: { label: 'View nodes', route: 'nodes' }
    })
  }

  return findings
}

export const detectVersionMismatch = (stats: ClusterStats | null): AttentionFinding[] => {
  const versions = stats?.nodes.versions || []
  if (versions.length <= 1) return []

  return [
    {
      id: 'mixed-versions',
      severity: 'info',
      title: 'Mixed Elasticsearch versions',
      summary: `Nodes running ${versions.join(', ')}`,
      detail: 'Expected during rolling upgrades; finish the upgrade when possible.',
      entity: { type: 'cluster', name: 'cluster' },
      action: { label: 'View nodes', route: 'nodes' }
    }
  ]
}

export const detectMonitoringProblems = (
  available: boolean | null,
  expectedNodes: number | null,
  observedNodes: number
): AttentionFinding[] => {
  if (available !== false) return []

  const summary =
    expectedNodes != null && expectedNodes > 0
      ? `Stats unavailable for nodes (${observedNodes} of ${expectedNodes} reporting)`
      : 'Could not retrieve node statistics'

  return [
    {
      id: 'monitoring',
      severity: 'info',
      title: 'Node monitoring incomplete',
      summary,
      detail: 'Insufficient permissions to retrieve node statistics, or the nodes stats API is unavailable.',
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

/**
 * Collapse related disk/index-block noise: if flood-stage is already reported for a node,
 * drop low/high watermark findings for that same node (flood supersedes).
 */
const dedupeFindings = (findings: AttentionFinding[]): AttentionFinding[] => {
  const floodNodes = new Set(
    findings
      .filter((f) => f.id.startsWith('disk-flood:'))
      .map((f) => f.entity?.name)
      .filter(Boolean)
  )

  return findings.filter((f) => {
    if (!f.id.startsWith('disk-watermark:')) return true
    return !floodNodes.has(f.entity?.name)
  })
}

export const buildAttentionFindings = (input: AttentionDetectorInput): AttentionFinding[] => {
  const now = input.now ?? Date.now()

  const findings = [
    ...detectShardProblems(input),
    ...detectIndexBlocks(input.indexBlocks),
    ...detectDiskProblems(input.nodes, input.diskWatermarks),
    ...detectAllocationSettings(input.allocationEnable),
    ...detectPendingTasks(input.pendingTasks),
    ...detectRecentRejections(input.pressureSamples, now),
    ...detectRecentBreakerTrips(input.pressureSamples, now),
    ...detectJvmPressure(input.heapSamples, now),
    ...detectFileDescriptorPressure(input.nodes),
    ...detectVersionMismatch(input.stats),
    ...detectMonitoringProblems(
      input.nodesMonitoringAvailable,
      input.stats?.nodes.count.total ?? input.health?.number_of_nodes ?? null,
      input.nodes.length
    )
  ]

  return sortFindings(dedupeFindings(findings))
}

type CheckDefinition = {
  id: string
  title: string
  /** Finding id prefixes that fold into this check row */
  prefixes: string[]
  okSummary: string
}

/** Stable expanded checklist — one row per concern area, OK when no finding. */
const CHECK_DEFINITIONS: CheckDefinition[] = [
  {
    id: 'shards',
    title: 'Shards',
    prefixes: ['unassigned-primaries', 'unassigned-replicas'],
    okSummary: 'All shards assigned'
  },
  {
    id: 'index-blocks',
    title: 'Index blocks',
    prefixes: ['index-blocks'],
    okSummary: 'No write or read-only blocks'
  },
  {
    id: 'allocation',
    title: 'Shard allocation',
    prefixes: ['allocation-disabled'],
    okSummary: 'Allocation enabled'
  },
  {
    id: 'pending-tasks',
    title: 'Pending cluster tasks',
    prefixes: ['pending-tasks'],
    okSummary: 'No stuck cluster tasks'
  },
  {
    id: 'disk',
    title: 'Disk watermarks',
    prefixes: ['disk-flood', 'disk-watermark'],
    okSummary: 'Below disk watermarks'
  },
  {
    id: 'rejections',
    title: 'Thread-pool rejections',
    prefixes: ['rejections'],
    okSummary: 'No new rejections'
  },
  {
    id: 'breakers',
    title: 'Circuit breakers',
    prefixes: ['breakers'],
    okSummary: 'No new breaker trips'
  },
  {
    id: 'jvm',
    title: 'JVM pressure',
    prefixes: ['jvm-pressure'],
    okSummary: 'No sustained heap pressure'
  },
  {
    id: 'file-descriptors',
    title: 'File descriptors',
    prefixes: ['file-descriptors'],
    okSummary: 'Within normal range'
  },
  {
    id: 'versions',
    title: 'Node versions',
    prefixes: ['mixed-versions'],
    okSummary: 'All nodes on the same version'
  },
  {
    id: 'monitoring',
    title: 'Node monitoring',
    prefixes: ['monitoring'],
    okSummary: 'Available'
  }
]

const findingMatchesCheck = (finding: AttentionFinding, prefixes: string[]): boolean => {
  const key = finding.id.split(':')[0]
  return prefixes.some((prefix) => key === prefix || finding.id.startsWith(`${prefix}:`))
}

const worstSeverity = (findings: AttentionFinding[]): AttentionFinding['severity'] => {
  if (findings.some((f) => f.severity === 'critical')) return 'critical'
  if (findings.some((f) => f.severity === 'warning')) return 'warning'
  return 'info'
}

/**
 * Always returns every check row for the expanded Attention card.
 * Findings fold into their check; otherwise the row is OK.
 */
export const buildAttentionChecks = (input: AttentionDetectorInput): AttentionCheck[] => {
  const findings = buildAttentionFindings(input)

  return CHECK_DEFINITIONS.map((def) => {
    const matched = findings.filter((f) => findingMatchesCheck(f, def.prefixes))
    if (!matched.length) {
      return {
        id: def.id,
        title: def.title,
        severity: 'ok',
        summary: def.okSummary
      }
    }

    const primary = matched[0]
    const summary = matched.length === 1 ? primary.summary : matched.map((f) => f.summary).join('; ')
    const detail =
      matched.length === 1
        ? primary.detail
        : matched
            .map((f) => f.detail)
            .filter(Boolean)
            .join(' ')

    return {
      id: def.id,
      title: matched.length === 1 ? primary.title : def.title,
      severity: worstSeverity(matched),
      summary,
      detail: detail || undefined,
      action: primary.action
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

      if (description.includes('read-only') && description.includes('allow delete')) {
        kinds.add('read_only_allow_delete')
      } else if (description.includes('read-only') || description.includes('read only')) {
        kinds.add('read_only')
      } else if (levels.includes('write') || description.includes('write')) {
        kinds.add('write')
      } else if (levels.length) {
        levels.forEach((l) => kinds.add(l))
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
