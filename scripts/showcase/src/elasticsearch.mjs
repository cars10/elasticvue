export const CLUSTERS = {
  production: { index: 0, nodes: ['http://es-production:9200', 'http://es-production-2:9200', 'http://es-production-3:9200'] },
  staging: { index: 1, nodes: ['http://es-staging:9200'] },
  logging: { index: 2, nodes: ['http://es-logging:9200'] }
}

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const es = async (uri, path, { method = 'GET', body, ndjson = false } = {}) => {
  const response = await fetch(`${uri}/${path}`, {
    method,
    headers: { 'Content-Type': ndjson ? 'application/x-ndjson' : 'application/json' },
    body: ndjson || body === undefined ? body : JSON.stringify(body)
  })
  const json = await response.json()
  if (!response.ok) throw new Error(`${method} ${uri}/${path} failed: ${JSON.stringify(json.error ?? json)}`)
  return json
}

export const waitForGreen = (cluster) => {
  const { nodes } = CLUSTERS[cluster]
  return es(nodes[0], `_cluster/health?wait_for_status=green&wait_for_nodes=${nodes.length}&timeout=120s`)
}

export const bulk = async (uri, index, docs) => {
  for (let i = 0; i < docs.length; i += 2000) {
    const lines = docs.slice(i, i + 2000).flatMap((doc) => [JSON.stringify({ index: { _index: index(doc) } }), JSON.stringify(doc)])
    const result = await es(uri, '_bulk', { method: 'POST', body: lines.join('\n') + '\n', ndjson: true })
    if (result.errors) throw new Error(`bulk failed: ${JSON.stringify(result.items.find((item) => item.index.error).index.error)}`)
  }
}
