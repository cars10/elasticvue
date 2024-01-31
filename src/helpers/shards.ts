type IndexName = string
type NodeName = string

export type EsShard = {
  index: IndexName,
  shard: string,
  prirep: string,
  state: string,
  node: NodeName,
  stats?: ShardStats
}

export type EsShardIndex = {
  health: string,
  index: IndexName,
  pri: string,
  rep: string,
  status: string
}

export type DocStats = {
  count: number,
  deleted: number
}

export type StoreStats = {
  size_in_bytes: number,
  reserved_in_bytes: number
}

export type ShardStats = {
  docs: DocStats,
  store: StoreStats
}

export type ClusterStats = {
  [key: number]: ShardStats[]
}

export type IndexStats = {
  uuid: string,
  shards: ClusterStats
}

export type Indices = {
  [key: string]: IndexStats
}

export type EsClusterStats = {
  indices: Indices
}

export type UnassignedShards = Record<IndexName, EsShard[]>

export type TableShards = {
  nodes: NodeName[],
  indexNames: IndexName[],
  indices: Record<IndexName, EsShardIndex>,
  unassignedShards: UnassignedShards,
  shards: Record<NodeName, Record<IndexName, EsShard[]>>
}

export const convertShards = (shards: EsShard[], indexHealth: EsShardIndex[], stats?: EsClusterStats): TableShards => {
  const nodes: string[] = []
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
      const index = shard.index;
      const indexStats = stats?.indices[index];

      if (shard.state !== 'RELOCATING') {
        node = shard.node
      } else {
        node = shard.node.split(/\s/)[0]
      }

      if (!result[node]) result[node] = {}
      if (!nodes.includes(node)) nodes.push(node)

      if (!result[node][index]) result[node][index] = []
      result[node][index].push(shard)
      result[node][index].sort(sortShards)
      if (indexStats) {
        shard.stats = Object.values(indexStats.shards)
        .flatMap(_shard => _shard)
        .map(_shard => {
          // Using Extract<T, U>
          const {docs, store} = _shard;
          return { docs, store };
        })
        .find((_shard, key: any) => key == shard.shard);
      }
    } else {
      const index = shard.index
      if (!unassignedShards[index]) unassignedShards[index] = []
      unassignedShards[index].push(shard)
      unassignedShards[index].sort(sortShards)
    }
  }

  return {
    nodes: nodes.sort(),
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
