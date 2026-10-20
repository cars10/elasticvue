import { EsNode } from '../types/types.ts'
import { nodeSpread, toNumber } from './nodeStats.ts'
import type { ShardsSummary } from '../types/shards.ts'

type IndexName = string
type NodeName = string

export type EsShard = {
  index: IndexName
  shard: string
  prirep: string
  state: string
  node: NodeName
  docs?: string | null
  store?: string | null
  'unassigned.reason'?: string | null
}

export type EsShardIndex = {
  health: string
  index: IndexName
  pri: string
  rep: string
}

export type UnassignedShards = Record<IndexName, EsShard[]>

export type TableShards = {
  nodes: NodeName[]
  indexNames: IndexName[]
  indices: Record<IndexName, EsShardIndex>
  unassignedShards: UnassignedShards
  shards: Record<NodeName, Record<IndexName, EsShard[]>>
}

export const convertShards = (shards: EsShard[], indexHealth: EsShardIndex[], nodes: Partial<EsNode>[]): TableShards => {
  const indices = Object.fromEntries(
    indexHealth.map((i) => [i.index, { index: i.index, health: i.health, pri: i.pri, rep: i.rep }])
  ) as Record<IndexName, EsShardIndex>

  const result: Record<NodeName, Record<IndexName, EsShard[]>> = {}
  const unassignedShards: UnassignedShards = {}
  for (const shard of shards) {
    if (shard.node) {
      const node = shardNodeName(shard) as NodeName
      result[node] ??= {}
      ;(result[node][shard.index] ??= []).push(shard)
    } else {
      ;(unassignedShards[shard.index] ??= []).push(shard)
    }
  }

  for (const byIndex of Object.values(result)) Object.values(byIndex).forEach((list) => list.sort(sortShards))
  Object.values(unassignedShards).forEach((list) => list.sort(sortShards))

  return {
    nodes: nodes
      .map((n) => n.name)
      .filter((name) => typeof name === 'string')
      .sort(),
    indices,
    indexNames: Object.keys(indices),
    shards: result,
    unassignedShards
  }
}

const sortShards = (a: EsShard, b: EsShard): number => {
  const shardA = parseInt(a.shard)
  const shardB = parseInt(b.shard)

  if (a.prirep === 'p' && b.prirep === 'r') return -1
  if (a.prirep === 'r' && b.prirep === 'p') return 1

  if (shardA < shardB) return -1
  if (shardA > shardB) return 1
  return 0
}

export const CAT_SHARDS_PARAMS = {
  h: ['index', 'shard', 'prirep', 'state', 'node', 'docs', 'store', 'unassigned.reason'],
  bytes: 'b'
}

export const OVERSIZED_SHARD_BYTES = 50 * 1024 ** 3

const isUnassigned = (shard: EsShard): boolean => shard.state === 'UNASSIGNED' || !shard.node

const RELOCATION_SEPARATOR = ' -> '

export const shardNodeName = (shard: EsShard): NodeName | null => shard.node?.split(RELOCATION_SEPARATOR)[0] || null

export const relocationTarget = (shard: EsShard): NodeName | null => {
  if (shard.state !== 'RELOCATING' || !shard.node?.includes(RELOCATION_SEPARATOR)) return null
  const [, target] = shard.node.split(RELOCATION_SEPARATOR)
  return target.split(' ').slice(2).join(' ') || null
}

type ShardSeverity = 'critical' | 'warning' | 'moving' | null

export const shardSeverity = (shard: EsShard): ShardSeverity => {
  if (isUnassigned(shard)) return shard.prirep === 'p' ? 'critical' : 'warning'
  if (shard.state === 'INITIALIZING' || shard.state === 'RELOCATING') return 'moving'
  return null
}

const SEVERITY_ORDER: Record<string, number> = { critical: 0, warning: 1, moving: 2 }

export const problemShards = (shards: EsShard[]): EsShard[] =>
  shards
    .map((shard) => ({ shard, rank: SEVERITY_ORDER[shardSeverity(shard) as string] }))
    .filter(({ rank }) => rank != null)
    .sort(
      (a, b) => a.rank - b.rank || a.shard.index.localeCompare(b.shard.index) || parseInt(a.shard.shard) - parseInt(b.shard.shard)
    )
    .map(({ shard }) => shard)

export const summarizeShards = (shards: EsShard[], dataNodeNames: string[]): ShardsSummary => {
  const perNode: Record<string, number> = Object.fromEntries(dataNodeNames.map((name) => [name, 0]))
  const reasons: Record<string, number> = {}
  const indices = new Set<string>()
  let primaries = 0
  let initializing = 0
  let relocating = 0
  let unassigned = 0
  let unassignedPrimaries = 0
  let primaryBytes = 0
  let startedPrimaries = 0
  let oversized = 0
  let largest: ShardsSummary['largest'] = null

  for (const shard of shards) {
    indices.add(shard.index)
    if (shard.prirep === 'p') primaries++

    if (isUnassigned(shard)) {
      unassigned++
      if (shard.prirep === 'p') unassignedPrimaries++
      const reason = shard['unassigned.reason'] || 'UNKNOWN'
      reasons[reason] = (reasons[reason] || 0) + 1
      continue
    }

    const node = shardNodeName(shard)
    if (node) perNode[node] = (perNode[node] || 0) + 1

    if (shard.state === 'INITIALIZING') initializing++
    if (shard.state === 'RELOCATING') relocating++
    if (shard.state !== 'STARTED' && shard.state !== 'RELOCATING') continue

    const bytes = toNumber(shard.store)
    if (bytes == null) continue
    if (bytes > OVERSIZED_SHARD_BYTES) oversized++
    if (shard.prirep === 'p') {
      primaryBytes += bytes
      startedPrimaries++
    }
    if (!largest || bytes > largest.bytes) {
      largest = { index: shard.index, shard: shard.shard, prirep: shard.prirep, bytes }
    }
  }

  return {
    total: shards.length,
    primaries,
    replicas: shards.length - primaries,
    indices: indices.size,
    initializing,
    relocating,
    unassigned,
    unassignedPrimaries,
    unassignedReasons: Object.entries(reasons)
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count || a.reason.localeCompare(b.reason)),
    spread: nodeSpread(Object.entries(perNode).map(([name, count]) => ({ name, count }))),
    largest,
    avgPrimaryBytes: startedPrimaries > 0 ? primaryBytes / startedPrimaries : null,
    oversized
  }
}
