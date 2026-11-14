import { flattenObj } from './flatten.ts'
import { hasOwn } from './search/documentValues.ts'
import { toNumber } from './nodeStats.ts'
import type {
  AllocationExplanation,
  AllocationSummary,
  EffectiveSetting,
  FlatClusterSettings,
  IndexToolState,
  NodeAllocation,
  ToolNode,
  ToolNodeInfo,
  WatermarkValidation,
  WatermarkValues
} from '../types/clusterTools.ts'

export const TOOL_SETTINGS_PARAMS = {
  include_defaults: 'true',
  filter_path: [
    'cluster.routing.allocation.enable',
    'cluster.routing.allocation.exclude',
    'cluster.routing.allocation.awareness',
    'cluster.routing.allocation.disk',
    'cluster.routing.rebalance.enable',
    'cluster.blocks',
    'indices.recovery.max_bytes_per_sec',
    'action.auto_create_index',
    'action.destructive_requires_name'
  ]
    .map((setting) => `*.${setting}`)
    .join(',')
}

export const TOOL_INDEX_SETTINGS_PARAMS = {
  filter_path: ['blocks', 'number_of_replicas', 'refresh_interval', 'hidden'].map((s) => `*.settings.index.${s}`).join(',')
}

export const TOOL_NODES_PARAMS = { filter_path: 'nodes.*.name,nodes.*.roles,nodes.*.attributes' }

export const ALLOCATION_PARAMS = { format: 'json', bytes: 'b', h: ['node', 'shards', 'disk.avail', 'disk.percent'] }

type NodesInfoBody = { nodes?: Record<string, { name?: string; roles?: string[]; attributes?: Record<string, string> }> } | null

export const parseToolNodeInfos = (body: NodesInfoBody): ToolNodeInfo[] =>
  Object.entries(body?.nodes || {}).map(([id, node]) => ({
    id,
    name: node?.name || id,
    roles: node?.roles || [],
    attributes: node?.attributes || {}
  }))

type CatAllocationRow = {
  node?: string
  shards?: string | number
  'disk.avail'?: string | number
  'disk.percent'?: string | number
}

export const parseNodeAllocations = (rows: CatAllocationRow[] | null): Record<string, NodeAllocation> =>
  Object.fromEntries(
    (Array.isArray(rows) ? rows : [])
      .filter((row) => row.node && row.node !== 'UNASSIGNED')
      .map((row) => [
        row.node,
        {
          shardCount: toNumber(row.shards) ?? 0,
          diskUsedPercent: toNumber(row['disk.percent']),
          diskAvailableBytes: toNumber(row['disk.avail'])
        }
      ])
  )

const NO_ALLOCATION: NodeAllocation = { shardCount: 0, diskUsedPercent: null, diskAvailableBytes: null }

export const mergeNodeAllocations = (nodes: ToolNodeInfo[], allocations: Record<string, NodeAllocation>): ToolNode[] =>
  nodes.map((node) => ({ ...node, ...(hasOwn(allocations, node.name) ? allocations[node.name] : NO_ALLOCATION) }))

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

type SettingValue = string | number | boolean | null

export const clusterSettingsUpdate = (
  values: Record<string, SettingValue>,
  current: FlatClusterSettings | null,
  canReset: boolean
) => {
  const keys = Object.keys(values)
  if (canReset) return { persistent: values, transient: Object.fromEntries(keys.map((key) => [key, null])) }

  const overridden = keys.filter((key) => values[key] !== null && current?.transient?.[key] != null)
  return { persistent: values, transient: Object.fromEntries(overridden.map((key) => [key, values[key]])) }
}

export const settingMode = (setting: EffectiveSetting<string>, fallback = 'all') =>
  String(setting.effectiveValue || fallback).toLowerCase()

export const parseCommaSeparated = (value?: string | number | boolean | null): string[] =>
  String(value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

export const addAllocationExclusion = (current: string | null | undefined, nodeId: string): string =>
  [...new Set([...parseCommaSeparated(current), nodeId])].join(',')

export const removeAllocationExclusion = (current: string | null | undefined, nodeId: string): string =>
  parseCommaSeparated(current)
    .filter((id) => id !== nodeId)
    .join(',')

export const nodeDrainProgress = (initial: number, remaining: number): number => {
  if (remaining <= 0) return 1
  if (initial <= 0) return 0
  return Math.max(0, Math.min(1, (initial - remaining) / initial))
}

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
          explanation: decider.explanation || '',
          nodeName: node.node_name
        }))
    ) || []
  const sameShard = decisions.some((decision) => decision.decider === 'same_shard')
  const singleNodeReplica = explanation.primary === false && eligibleDataNodeCount === 1 && sameShard

  return {
    primary: explanation.primary !== false,
    reason: singleNodeReplica ? null : explanation.allocate_explanation || explanation.unassigned_info?.details || null,
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
    const settings: Record<string, unknown> = flattenObj(body.settings || {})
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
      error: 'mixed'
    }
  }
  if (allPercent) {
    const [lowValue, highValue, floodValue] = percents as number[]
    if (!(lowValue <= highValue && highValue <= floodValue)) {
      return { valid: false, mode: 'percent', error: 'percent_order' }
    }
    return { valid: true, mode: 'percent', error: '' }
  }

  const [lowValue, highValue, floodValue] = bytes as number[]
  if (!(lowValue >= highValue && highValue >= floodValue)) {
    return { valid: false, mode: 'bytes', error: 'bytes_order' }
  }
  return { valid: true, mode: 'bytes', error: '' }
}
