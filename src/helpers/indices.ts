import type { EsIndicesBlocksSettings, IndexBlocks, IndicesSummary } from '../types/indices.ts'
import type ElasticsearchIndex from '../models/ElasticsearchIndex.ts'

export const INDEX_BLOCKS_PARAMS = { filter_path: '*.settings.index.blocks', expand_wildcards: 'all' }

export const CAT_ALIASES_PARAMS = { h: 'alias,index' }

export const NO_BLOCKS: IndexBlocks = { write: false, readOnly: false, readOnlyAllowDelete: false }

const isTrue = (value: unknown) => value === true || value === 'true'

export const parseIndexBlocks = (body: EsIndicesBlocksSettings | null): Record<string, IndexBlocks> =>
  Object.fromEntries(
    Object.entries(body || {}).map(([index, data]) => {
      const blocks = data?.settings?.index?.blocks
      return [
        index,
        {
          write: isTrue(blocks?.write),
          readOnly: isTrue(blocks?.read_only),
          readOnlyAllowDelete: isTrue(blocks?.read_only_allow_delete)
        }
      ]
    })
  )

export const aliasesByIndex = (rows: { alias: string; index: string }[] | null): Record<string, string[]> => {
  const aliases: Record<string, string[]> = {}

  for (const { alias, index } of rows || []) {
    aliases[index] = [...(aliases[index] || []), alias].sort()
  }

  return aliases
}

export const isReadOnly = (blocks?: IndexBlocks | null) =>
  !!blocks && (blocks.write || blocks.readOnly || blocks.readOnlyAllowDelete)

export const writableSettingsBody = (blocks?: IndexBlocks | null) => ({
  index: {
    blocks: {
      write: false,
      ...(blocks?.readOnly && { read_only: false }),
      ...(blocks?.readOnlyAllowDelete && { read_only_allow_delete: false })
    }
  }
})

export const isHiddenIndex = (index: string, hideIndicesRegex: string) => {
  try {
    return !!hideIndicesRegex && new RegExp(hideIndicesRegex).test(index)
  } catch {
    return false
  }
}

const toNumber = (value: number | string) => (typeof value === 'number' && Number.isFinite(value) ? value : 0)

export const summarizeIndices = (indices: ElasticsearchIndex[], blocksKnown: boolean): IndicesSummary => {
  const count = (predicate: (index: ElasticsearchIndex) => boolean) => indices.filter(predicate).length
  const sum = (value: (index: ElasticsearchIndex) => number) => indices.reduce((total, index) => total + value(index), 0)
  const storeBytes = (index: ElasticsearchIndex) => toNumber(index.parsedStoreSize)

  const largest = [...indices].sort((a, b) => storeBytes(b) - storeBytes(a))[0]

  return {
    total: indices.length,
    open: count((index) => index.status === 'open'),
    closed: count((index) => index.status === 'close'),
    health: {
      green: count((index) => index.health === 'green'),
      yellow: count((index) => index.health === 'yellow'),
      red: count((index) => index.health === 'red')
    },
    docs: sum((index) => toNumber(index.parsedDocsCount)),
    storeBytes: sum(storeBytes),
    primaries: sum((index) => toNumber(index.parsedPri)),
    replicas: sum((index) => toNumber(index.parsedPri) * (parseInt(index.rep) || 0)),
    largest: largest && storeBytes(largest) ? { index: largest.index, storeBytes: storeBytes(largest) } : null,
    readOnly: blocksKnown ? count((index) => isReadOnly(index.blocks)) : null,
    diskBlocked: indices.filter((index) => index.blocks?.readOnlyAllowDelete).map((index) => index.index)
  }
}
