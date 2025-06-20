import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  importNewClusters, loadPredefinedClusters,
  PredefinedCluster,
} from '../../../src/composables/components/predefinedclusters/PredefinedClusters'

import { AuthType, BuildFlavor, ElasticsearchCluster } from '../../../src/store/connection'

describe('clusterImport helpers', () => {
  beforeEach(() => {
    // Manual mock for localStorage
    let store: Record<string, string> = {}

    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key) => store[key] ?? null),
      setItem: vi.fn((key, val) => {
        store[key] = val
      }),
      removeItem: vi.fn((key) => {
        delete store[key]
      }),
      clear: vi.fn(() => {
        store = {}
      })
    })
  })

  describe('importNewClusters', () => {
    it('creates new clusters and stores all in localStorage', () => {
      const predefined: PredefinedCluster[] = [
        {
          name: 'pre1',
          uri: 'http://pre1',
          username: 'a',
          password: 'b'
        }
      ]

      const existing: ElasticsearchCluster[] = [
        {
          name: 'existing',
          uri: 'http://existing',
          clusterName: '',
          version: '',
          majorVersion: '',
          distribution: '',
          uuid: '',
          status: '',
          loading: false,
          predefined: false,
          flavor: BuildFlavor.default,
          auth: {
            authType: AuthType.none,
            authData: undefined
          }
        }
      ]

      importNewClusters(predefined, existing)

      const saved = JSON.parse(localStorage.getItem('connection') as string)
      expect(saved.clusters.length).toBe(2)
      expect(saved.clusters[0].name).toBe('pre1')
      expect(saved.clusters[1].name).toBe('existing')
      expect(saved.activeClusterIndex).toBe(0)
    })
  })

  describe('loadPredefinedClusters', () => {
    it('fetches valid clusters with uri', async () => {
      const fakeClusters: PredefinedCluster[] = [
        { uri: 'http://one' },
        { uri: '' },
        { uri: 'http://two', apiKey: 'x' }
      ]

      global.fetch = vi.fn().mockResolvedValue({
        status: 200,
        headers: {
          get: () => 'application/json'
        },
        json: () => Promise.resolve(fakeClusters)
      })

      const result = await loadPredefinedClusters()
      expect(result).toEqual([
        { uri: 'http://one' },
        { uri: 'http://two', apiKey: 'x' }
      ])
    })

    it('returns undefined on fetch failure', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('fail'))
      const result = await loadPredefinedClusters()
      expect(result).toBeUndefined()
    })

    it('returns undefined on non-JSON content type', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        status: 200,
        headers: { get: () => 'text/html' },
        json: () => Promise.resolve([])
      })

      const result = await loadPredefinedClusters()
      expect(result).toBeUndefined()
    })
  })
})
