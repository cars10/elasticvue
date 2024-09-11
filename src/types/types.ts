export type EsNode = {
  name: string,
  id: string,
  ip: string,
  version: string,
  'heap.percent': string,
  'heap.current': string,
  'heap.max': string,
  'ram.percent': string,
  'ram.current': string,
  'ram.max': string,
  'disk.used_percent': string,
  'disk.used': string,
  'disk.total': string,
  cpu: string,
  load_1m: string,
  load_5m: string,
  load_15m: string,
  'node.role': string,
  master: string,
  attributes: Record<string, string>
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