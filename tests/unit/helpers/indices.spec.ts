import { describe, expect, it } from 'vitest'
import {
  aliasesByIndex,
  isHiddenIndex,
  isReadOnly,
  parseIndexBlocks,
  summarizeIndices,
  writableSettingsBody
} from '../../../src/helpers/indices'
import ElasticsearchIndex from '../../../src/models/ElasticsearchIndex'
import type { EsIndex } from '../../../src/composables/components/indices/IndicesTable'

const blocks = parseIndexBlocks({
  locked: { settings: { index: { blocks: { write: 'true' } } } },
  frozen: { settings: { index: { blocks: { read_only: true } } } },
  full: { settings: { index: { blocks: { read_only_allow_delete: 'true', write: 'false' } } } },
  open: { settings: { index: { blocks: { write: 'false' } } } }
})

const esIndex = (index: string, overrides: Partial<EsIndex> = {}): EsIndex => ({
  index,
  health: 'green',
  status: 'open',
  uuid: `${index}-uuid`,
  pri: '1',
  rep: '1',
  sc: '1',
  'docs.count': '10',
  'store.size': '100',
  cd: '1000',
  ...overrides
})

describe('parseIndexBlocks', () => {
  it('parses string and boolean block values', () => {
    expect(blocks).toEqual({
      locked: { write: true, readOnly: false, readOnlyAllowDelete: false },
      frozen: { write: false, readOnly: true, readOnlyAllowDelete: false },
      full: { write: false, readOnly: false, readOnlyAllowDelete: true },
      open: { write: false, readOnly: false, readOnlyAllowDelete: false }
    })
  })

  it('handles empty responses', () => {
    expect(parseIndexBlocks({})).toEqual({})
    expect(parseIndexBlocks(null)).toEqual({})
  })
})

describe('aliasesByIndex', () => {
  it('groups and sorts alias names per index', () => {
    expect(
      aliasesByIndex([
        { alias: 'logs', index: 'logs-2' },
        { alias: 'all', index: 'logs-2' },
        { alias: 'all', index: 'metrics' }
      ])
    ).toEqual({ 'logs-2': ['all', 'logs'], metrics: ['all'] })
    expect(aliasesByIndex(null)).toEqual({})
  })
})

describe('isReadOnly', () => {
  it('treats any block as read-only', () => {
    expect(['locked', 'frozen', 'full', 'open'].map((name) => isReadOnly(blocks[name]))).toEqual([true, true, true, false])
    expect(isReadOnly(null)).toBe(false)
  })
})

describe('writableSettingsBody', () => {
  it('only resets the blocks that are set, so older versions accept the request', () => {
    expect(writableSettingsBody(blocks.locked)).toEqual({ index: { blocks: { write: false } } })
    expect(writableSettingsBody(blocks.frozen)).toEqual({ index: { blocks: { write: false, read_only: false } } })
    expect(writableSettingsBody(blocks.full)).toEqual({ index: { blocks: { write: false, read_only_allow_delete: false } } })
    expect(writableSettingsBody(null)).toEqual({ index: { blocks: { write: false } } })
  })
})

describe('isHiddenIndex', () => {
  it('matches the regex and ignores invalid ones', () => {
    expect(isHiddenIndex('.kibana', '^\\.')).toBe(true)
    expect(isHiddenIndex('logs', '^\\.')).toBe(false)
    expect(isHiddenIndex('logs', '')).toBe(false)
    expect(isHiddenIndex('logs', '[')).toBe(false)
  })
})

describe('summarizeIndices', () => {
  const indices = [
    new ElasticsearchIndex({ ...esIndex('a', { 'store.size': '500', rep: '2' }), blocks: blocks.full }),
    new ElasticsearchIndex({ ...esIndex('b', { health: 'yellow' }), blocks: blocks.locked }),
    new ElasticsearchIndex({ ...esIndex('c', { status: 'close', health: '', 'docs.count': '', 'store.size': '' }), blocks: null })
  ]

  it('summarizes counts, health, storage and blocks', () => {
    expect(summarizeIndices(indices, true)).toEqual({
      total: 3,
      open: 2,
      closed: 1,
      health: { green: 1, yellow: 1, red: 0 },
      docs: 20,
      storeBytes: 600,
      primaries: 3,
      replicas: 4,
      largest: { index: 'a', storeBytes: 500 },
      readOnly: 2,
      diskBlocked: ['a']
    })
  })

  it('reports unknown blocks as null', () => {
    expect(summarizeIndices(indices, false).readOnly).toBeNull()
  })

  it('handles no indices', () => {
    expect(summarizeIndices([], true)).toMatchObject({ total: 0, largest: null, readOnly: 0, diskBlocked: [] })
  })
})
