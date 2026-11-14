export type IndexBlocks = {
  write: boolean
  readOnly: boolean
  readOnlyAllowDelete: boolean
}

type EsIndexBlocks = {
  write?: string | boolean
  read_only?: string | boolean
  read_only_allow_delete?: string | boolean
}

export type EsIndicesBlocksSettings = Record<string, { settings?: { index?: { blocks?: EsIndexBlocks } } }>

export type IndicesSummary = {
  total: number
  open: number
  closed: number
  health: { green: number; yellow: number; red: number }
  docs: number
  storeBytes: number
  primaries: number
  replicas: number
  largest: { index: string; storeBytes: number } | null
  readOnly: number | null
  diskBlocked: string[]
}
