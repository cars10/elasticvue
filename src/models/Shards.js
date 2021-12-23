export const convertSource = (shards, indexHealth) => {
  const nodes = []
  const indices = Object.assign({}, ...(indexHealth.map(i => ({
    [i.index]: {
      health: i.health,
      pri: i.pri,
      rep: i.rep
    }
  }))))
  const result = {}
  for (const shard of shards) {
    const node = shard.node || 'unassigned'
    if (!result[node]) result[node] = {}
    if (!nodes.includes(node) && node !== 'unassigned') nodes.push(node)

    const index = shard.index
    if (!result[node][index]) result[node][index] = []
    result[node][index].push(shard)
    result[node][index].sort((a, b) => {
      const shardA = parseInt(a.shard)
      const shardB = parseInt(b.shard)

      if (shardA < shardB) return -1
      if (shardA > shardB) return 1
      return 0
    })
  }

  nodes.sort().unshift('unassigned')
  return {
    nodes,
    indices,
    indexNames: Object.keys(indices),
    shards: result
  }
}
