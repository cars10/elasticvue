import type {
  AllocationExplanation,
  AllocationSummary,
  EffectiveSetting,
  FlatClusterSettings,
  IndexToolState,
  ToolShard,
  WatermarkValidation,
  WatermarkValues
} from '../types/clusterTools.ts'

const TRUE_VALUES = new Set([true, 'true'])
const BYTE_UNITS: Record<string, number> = {
  b: 1,
  kb: 1024,
  mb: 1024 ** 2,
  gb: 1024 ** 3,
  tb: 1024 ** 4,
  pb: 1024 ** 5
}

export const effectiveSetting = <T = string>(
  settings: FlatClusterSettings | null,
  key: string,
  fallback: T | null = null
): EffectiveSetting<T> => {
  const transient = settings?.transient?.[key] as T | null | undefined
  const persistent = settings?.persistent?.[key] as T | null | undefined
  const defaultValue = (settings?.defaults?.[key] as T | null | undefined) ?? fallback

  if (transient !== undefined && transient !== null) {
    return { key, configuredValue: transient, defaultValue, effectiveValue: transient, source: 'transient' }
  }
  if (persistent !== undefined && persistent !== null) {
    return { key, configuredValue: persistent, defaultValue, effectiveValue: persistent, source: 'persistent' }
  }
  if (defaultValue !== undefined && defaultValue !== null) {
    return { key, configuredValue: null, defaultValue, effectiveValue: defaultValue, source: 'default' }
  }
  return { key, configuredValue: null, defaultValue: null, effectiveValue: null, source: 'unavailable' }
}

export const persistentSettingBody = (key: string, value: string | number | boolean | null) => ({
  persistent: { [key]: value }
})

export const parseCommaSeparated = (value?: string | number | boolean | null): string[] =>
  String(value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

export const addAllocationExclusion = (current: string | null | undefined, nodeId: string): string =>
  [...new Set([...parseCommaSeparated(current), nodeId])].join(',')

export const removeAllocationExclusion = (current: string | null | undefined, nodeId: string): string | null => {
  const remaining = parseCommaSeparated(current).filter((id) => id !== nodeId)
  return remaining.length ? remaining.join(',') : null
}

export const nodeDrainProgress = (initial: number, remaining: number): number => {
  if (remaining <= 0) return 1
  if (initial <= 0) return 0
  return Math.max(0, Math.min(1, (initial - remaining) / initial))
}

export const isUnassignedShard = (shard: ToolShard) => shard.state?.toUpperCase() === 'UNASSIGNED' || !shard.node

export const summarizeAllocationExplanation = (
  explanation: AllocationExplanation,
  eligibleDataNodeCount: number
): AllocationSummary => {
  const decisions =
    explanation.node_allocation_decisions?.flatMap((node) =>
      (node.deciders || [])
        .filter((decider) => decider.decision?.toUpperCase() === 'NO')
        .map((decider) => ({
          decider: decider.decider || 'unknown',
          explanation: decider.explanation || 'Elasticsearch did not provide an explanation.',
          nodeName: node.node_name
        }))
    ) || []
  const sameShard = decisions.some((decision) => decision.decider === 'same_shard')
  const singleNodeReplica = explanation.primary === false && eligibleDataNodeCount === 1 && sameShard

  return {
    title: explanation.primary === false ? 'Cannot allocate replica shard' : 'Cannot allocate primary shard',
    reason: singleNodeReplica
      ? 'This replica cannot be assigned because Elasticsearch cannot place a primary and its replica on the same node.'
      : explanation.allocate_explanation ||
        explanation.unassigned_info?.details ||
        'No eligible node currently allows this shard.',
    decisions,
    singleNodeReplica
  }
}

const settingValue = (settings: Record<string, unknown>, ...keys: string[]) => {
  for (const key of keys) {
    if (settings[key] !== undefined) return settings[key]
  }
  return undefined
}

export const parseIndexToolStates = (
  response: Record<string, { settings?: Record<string, unknown> }> | null,
  dataStreamBackingIndices: Set<string> = new Set()
): IndexToolState[] =>
  Object.entries(response || {}).map(([name, body]) => {
    const settings = body.settings || {}
    const blocks = ['read_only', 'write', 'read_only_allow_delete', 'metadata', 'read'].filter((block) =>
      TRUE_VALUES.has(
        settingValue(settings, `index.blocks.${block}`, `index.blocks.${block.replaceAll('_', '.')}`) as string | boolean
      )
    )
    const replicas = settingValue(settings, 'index.number_of_replicas', 'index.number.of.replicas')
    const refreshInterval = settingValue(settings, 'index.refresh_interval', 'index.refresh.interval')
    return {
      name,
      replicas: replicas === undefined ? null : Number(replicas),
      refreshInterval: refreshInterval === undefined ? null : String(refreshInterval),
      blocks,
      hidden: name.startsWith('.') || TRUE_VALUES.has(settingValue(settings, 'index.hidden') as string | boolean),
      dataStreamBacking: dataStreamBackingIndices.has(name) || name.startsWith('.ds-')
    }
  })

export const userManagedIndices = (indices: IndexToolState[]) =>
  indices.filter((index) => !index.hidden && !index.dataStreamBacking)

export const indicesNeedingZeroReplicaHelper = (indices: IndexToolState[], eligibleDataNodeCount: number) =>
  eligibleDataNodeCount === 1 ? userManagedIndices(indices).filter((index) => (index.replicas ?? 0) > 0) : []

const parsePercentOrRatio = (value: string): number | null => {
  const trimmed = value.trim().toLowerCase()
  if (trimmed.endsWith('%')) {
    const parsed = Number(trimmed.slice(0, -1))
    return Number.isFinite(parsed) && parsed >= 0 && parsed <= 100 ? parsed : null
  }
  if (/^(?:0(?:\.\d+)?|1(?:\.0+)?)$/.test(trimmed)) {
    const parsed = Number(trimmed)
    return Number.isFinite(parsed) ? parsed * 100 : null
  }
  return null
}

export const parseByteValue = (value: string): number | null => {
  const match = value
    .trim()
    .toLowerCase()
    .match(/^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb|tb|pb)$/)
  if (!match) return null
  return Number(match[1]) * BYTE_UNITS[match[2]]
}

export const validateWatermarks = ({ low, high, flood }: WatermarkValues): WatermarkValidation => {
  const values = [low, high, flood]
  const percents = values.map(parsePercentOrRatio)
  const bytes = values.map(parseByteValue)
  const allPercent = percents.every((value) => value !== null)
  const allBytes = bytes.every((value) => value !== null)

  if (!allPercent && !allBytes) {
    return {
      valid: false,
      mode: null,
      error: 'Use either percentages/ratios for all thresholds or free-space byte values for all thresholds.'
    }
  }
  if (allPercent) {
    const [lowValue, highValue, floodValue] = percents as number[]
    if (!(lowValue <= highValue && highValue <= floodValue)) {
      return { valid: false, mode: 'percent', error: 'Used-disk thresholds must increase from low to high to flood stage.' }
    }
    return { valid: true, mode: 'percent', error: '' }
  }

  const [lowValue, highValue, floodValue] = bytes as number[]
  if (!(lowValue >= highValue && highValue >= floodValue)) {
    return { valid: false, mode: 'bytes', error: 'Free-space thresholds must decrease from low to high to flood stage.' }
  }
  return { valid: true, mode: 'bytes', error: '' }
}

export const clusterToolsCapabilities = (version?: string | null, modernFork = false) => {
  const major = Number.parseInt(version || '', 10)
  const minor = Number.parseInt((version || '').split('.')[1] || '', 10)
  const unknown = Number.isNaN(major)
  const atLeast = (requiredMajor: number, requiredMinor = 0) =>
    modernFork || unknown || major > requiredMajor || (major === requiredMajor && minor >= requiredMinor)

  return {
    allocationExplain: atLeast(5),
    retryFailed: atLeast(5),
    floodStage: atLeast(6),
    dataStreams: atLeast(7, 9),
    maxHeadroom: atLeast(8, 5),
    clusterReadOnlyAllowDelete: atLeast(6),
    votingExclusions: atLeast(7, 8),
    expandWildcardsAll: atLeast(8),
    tools: {
      allocation: atLeast(1),
      drain: atLeast(1),
      explain: atLeast(5),
      retry: atLeast(5),
      rebalancing: atLeast(1),
      blocks: atLeast(1),
      replicas: atLeast(1),
      refresh: atLeast(1),
      watermarks: atLeast(1),
      recovery: atLeast(1),
      destructive: atLeast(1),
      autoCreate: atLeast(1),
      clusterWrite: atLeast(1),
      voting: atLeast(7, 8),
      awareness: atLeast(1)
    } as Record<string, boolean>
  }
}

export const clusterToolIsSupported = (toolId: string, capabilities: ReturnType<typeof clusterToolsCapabilities>): boolean => {
  return capabilities.tools[toolId] === true
}
