import { EsNode } from '../types/types.ts'

type IndexName = string
type NodeName = string

export type EsShard = {
  index: IndexName,
  shard: string,
  prirep: string,
  state: string,
  node: NodeName
}

export type EsShardIndex = {
  health: string,
  index: IndexName,
  pri: string,
  rep: string,
  status: string
}

export type UnassignedShards = Record<IndexName, EsShard[]>

export type TableShards = {
  nodes: NodeName[],
  indexNames: IndexName[],
  indices: Record<IndexName, EsShardIndex>,
  unassignedShards: UnassignedShards,
  shards: Record<NodeName, Record<IndexName, EsShard[]>>
}

export const convertShards = (shards: EsShard[], indexHealth: EsShardIndex[], nodes: Partial<EsNode>[]): TableShards => {
  const indices = Object.assign({}, ...(indexHealth.map(i => ({
    [i.index]: {
      index: i.index,
      health: i.health,
      pri: i.pri,
      rep: i.rep
    }
  }))))

  const result: Record<string, any> = {}
  const unassignedShards: UnassignedShards = {}
  for (const shard of shards) {
    if (shard.node) {
      let node

      if (shard.state !== 'RELOCATING') {
        node = shard.node
      } else {
        node = shard.node.split(/\s/)[0]
      }

      if (!result[node]) result[node] = {}

      const index = shard.index
      if (!result[node][index]) result[node][index] = []
      result[node][index].push(shard)
      result[node][index].sort(sortShards)
    } else {
      const index = shard.index
      if (!unassignedShards[index]) unassignedShards[index] = []
      unassignedShards[index].push(shard)
      unassignedShards[index].sort(sortShards)
    }
  }

  return {
    nodes: nodes.map(n => n.name).filter(name => typeof name === 'string').sort(),
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
