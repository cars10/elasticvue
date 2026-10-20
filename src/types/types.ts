export type EsNode = {
  name: string
  id: string
  ip: string
  version: string
  'heap.percent': string
  'heap.current': string
  'heap.max': string
  'disk.used_percent': string
  'disk.used': string
  'disk.total': string
  cpu: string
  'node.role': string
  master: string
  attributes: Record<string, string>
  shards?: string
}

export type NodeAttributes = {
  nodes: Record<string, NodeAttribute>
}

type NodeAttribute = {
  settings: {
    node: {
      attr: Record<string, string>
    }
  }
}
