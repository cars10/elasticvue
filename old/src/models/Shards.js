export const convertSource = (shards, indexHealth) => {
  const nodes = []
  const indices = Object.assign({}, ...(indexHealth.map(i => ({
    [i.index]: {
      index: i.index,
      health: i.health,
      pri: i.pri,
      rep: i.rep
    }
  }))))

  const result = {}
  const unassignedShards = {}
  for (const shard of shards) {
    if (shard.node) {
      let node

      if (shard.state !== 'RELOCATING') {
        node = shard.node
      } else {
        node = shard.node.split(/\s/)[0]
      }

      if (!result[node]) result[node] = {}
      if (!nodes.includes(node)) nodes.push(node)

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
    nodes: nodes.sort(),
    indices,
    indexNames: Object.keys(indices),
    shards: result,
    unassignedShards
  }
}

const sortShards = (a, b) => {
  const shardA = parseInt(a.shard)
  const shardB = parseInt(b.shard)

  if (a.prirep === 'p' && b.prirep === 'r') return -1
  if (a.prirep === 'r' && b.prirep === 'p') return 1

  if (shardA < shardB) return -1
  if (shardA > shardB) return 1
  return 0
}
