

type Index = {
  index: string
}

type Snapshot = {
  id: string,
  status: string,
  start_time: string,
  start_epoch: string,
  end_time: string,
  end_epoch: string,
  duration: string,
  successful_shards: number,
  failed_shards: number,
  total_shards: number,
  indices: number
}

type SearchResult = {
  hits: SearchResultHits
}

type SearchResultHits = {
  hits: any
}

export type EsNode = {
  name: string,
  id: string,
  ip: string,
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
  master: string
}