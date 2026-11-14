import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const deleteDB = vi.fn()
vi.mock('idb', () => ({ deleteDB: (...args: unknown[]) => deleteDB(...args) }))

import { CLUSTER_STORE_PREFIXES, clusterStorageKeys, removeClusterStorage } from '../../../src/helpers/clusterStorage'

describe('helpers/clusterStorage.ts', () => {
  let items: Record<string, string>

  beforeEach(() => {
    deleteDB.mockReset()
    items = {}
    vi.stubGlobal('localStorage', {
      removeItem: (key: string) => delete items[key],
      setItem: (key: string, value: string) => (items[key] = value)
    })
  })

  afterEach(() => vi.unstubAllGlobals())

  it('builds one key per cluster scoped store', () => {
    expect(clusterStorageKeys('abc')).toHaveLength(CLUSTER_STORE_PREFIXES.length)
    expect(clusterStorageKeys('abc')).toContain('search-abc')
    expect(clusterStorageKeys('abc')).toContain('tasks-abc')
  })

  it('removes the stores and database of one cluster only', async () => {
    items = { 'search-abc': '{}', 'rest-abc': '{}', 'search-other': '{}', connection: '{}' }

    await removeClusterStorage('abc')

    expect(Object.keys(items).sort()).toEqual(['connection', 'search-other'])
    expect(deleteDB).toHaveBeenCalledWith('elasticvue-abc')
  })

  it('does not throw when storage is unavailable', async () => {
    deleteDB.mockRejectedValue(new Error('blocked'))
    vi.spyOn(console, 'error').mockImplementation(() => {})

    await expect(removeClusterStorage('abc')).resolves.toBeUndefined()
  })
})
