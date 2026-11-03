import { describe, it } from 'vitest'
import {
  clusterStorageKeyMoves,
  migrateAuthType,
  migrateClusterIds,
  migrateConnectionState,
  OldElasticsearchCluster
} from '../../src/services/migrations'
import { AuthType, BuildFlavor } from '../../src/store/connection'

const oldData: OldElasticsearchCluster[] = [
  {
    name: 'no auth',
    username: '',
    password: '',
    uri: 'http://localhost:9506',
    distribution: 'elasticsearch',
    clusterName: '',
    version: '6.8.2',
    majorVersion: '6',
    uuid: '',
    status: '',
    flavor: BuildFlavor.default
  },
  {
    name: 'basic auth',
    username: 'user',
    password: 'pass',
    uri: 'http://localhost:9507',
    distribution: 'elasticsearch',
    clusterName: '',
    version: '7.17.22',
    majorVersion: '7',
    uuid: '',
    status: '',
    flavor: BuildFlavor.default
  },
  {
    name: 'api key',
    username: '',
    password: 'apikey',
    uri: 'http://localhost:9508',
    distribution: 'elasticsearch',
    clusterName: '',
    version: '8.14.3',
    majorVersion: '8',
    uuid: '',
    status: '',
    flavor: BuildFlavor.default
  }
]

describe.concurrent('migrate', () => {
  it('migrate', async ({ expect }) => {
    const result = migrateAuthType(oldData)
    expect(result[0].auth.authType).toEqual(AuthType.none)
    expect(result[1].auth.authType).toEqual(AuthType.basicAuth)
    expect(result[2].auth.authType).toEqual(AuthType.apiKey)
  })
})

describe.concurrent('migrateClusterIds', () => {
  const clusters = migrateAuthType(oldData)

  it('adds ids and maps the active index to its id', ({ expect }) => {
    const result = migrateClusterIds({ clusters, activeClusterIndex: 1 })

    expect(result.clusters.every((cluster) => cluster.id.length > 0)).toBe(true)
    expect(new Set(result.clusters.map((cluster) => cluster.id)).size).toBe(clusters.length)
    expect(result.activeClusterId).toBe(result.clusters[1].id)
    expect('activeClusterIndex' in result).toBe(false)
  })

  it('keeps existing ids and active id', ({ expect }) => {
    const first = migrateClusterIds({ clusters, activeClusterIndex: 0 })
    const second = migrateClusterIds(first)

    expect(second).toEqual(first)
  })

  it('falls back to null for an out of range index', ({ expect }) => {
    expect(migrateClusterIds({ clusters, activeClusterIndex: 1337 }).activeClusterId).toBeNull()
  })
})

describe.concurrent('clusterStorageKeyMoves', () => {
  const clusters = [
    { id: 'a', uuid: 'shared' },
    { id: 'b', uuid: 'shared' },
    { id: 'c', uuid: 'other' },
    { id: 'd', uuid: '' }
  ]

  it('moves existing uuid keys to every cluster id with that uuid', ({ expect }) => {
    const moves = clusterStorageKeyMoves(clusters, ['rest-shared', 'search-shared', 'indices-other', 'rest-', 'connection'])

    expect(moves).toEqual([
      ['rest-shared', 'rest-a'],
      ['search-shared', 'search-a'],
      ['rest-shared', 'rest-b'],
      ['search-shared', 'search-b'],
      ['indices-other', 'indices-c']
    ])
  })

  it('keeps keys that already exist for the cluster id', ({ expect }) => {
    expect(clusterStorageKeyMoves(clusters, ['rest-shared', 'rest-a', 'rest-b'])).toEqual([])
  })
})

const masterCluster = (overrides: Record<string, unknown>) => ({
  name: 'cluster',
  uri: 'http://localhost:9200',
  clusterName: 'docker-cluster',
  version: '8.15.0',
  majorVersion: '8',
  distribution: 'elasticsearch',
  uuid: 'ecdKaffmR9WkFbKDW4PUWw',
  status: 'green',
  loading: false,
  flavor: 'default',
  ...overrides
})

describe.concurrent('migrateConnectionState', () => {
  it('migrates master data with all auth types', ({ expect }) => {
    const result = migrateConnectionState({
      activeClusterIndex: 2,
      clusters: [
        masterCluster({ name: 'none', auth: { authType: 'none', authData: {} } }),
        masterCluster({ name: 'basic', auth: { authType: 'basicAuth', authData: { username: 'elastic', password: 'pw' } } }),
        masterCluster({ name: 'key', auth: { authType: 'apiKey', authData: { apiKey: 'abc' } } }),
        masterCluster({
          name: 'aws',
          auth: { authType: 'awsIAM', authData: { accessKeyId: 'AKIA', secretAccessKey: 'secret', region: 'eu-west-1' } }
        })
      ]
    })!

    expect(result.clusters.map((cluster: { auth: unknown }) => cluster.auth)).toEqual([
      { authType: AuthType.none, authData: {} },
      { authType: AuthType.basicAuth, authData: { username: 'elastic', password: 'pw' } },
      { authType: AuthType.apiKey, authData: { apiKey: 'abc' } },
      { authType: AuthType.awsIAM, authData: { accessKeyId: 'AKIA', secretAccessKey: 'secret', region: 'eu-west-1' } }
    ])
    expect(result.activeClusterId).toBe(result.clusters[2].id)
    expect(result.clusters[1]).toMatchObject({ name: 'basic', uri: 'http://localhost:9200', version: '8.15.0' })
  })

  it('removes secrets of previously selected auth types', ({ expect }) => {
    const result = migrateConnectionState({
      activeClusterIndex: 0,
      clusters: [
        masterCluster({
          auth: { authType: 'apiKey', authData: { username: 'elastic', password: 'old-password', apiKey: 'abc' } }
        }),
        masterCluster({
          auth: {
            authType: 'none',
            authData: { username: 'elastic', password: 'pw', accessKeyId: 'AKIA', secretAccessKey: 'secret', region: 'x' }
          }
        })
      ]
    })!

    expect(result.clusters[0].auth).toEqual({ authType: AuthType.apiKey, authData: { apiKey: 'abc' } })
    expect(result.clusters[1].auth).toEqual({ authType: AuthType.none, authData: {} })
    expect(JSON.stringify(result)).not.toContain('old-password')
    expect(JSON.stringify(result)).not.toContain('secret')
  })

  it('keeps sending an api key for basic auth without username', ({ expect }) => {
    const result = migrateConnectionState({
      clusters: [masterCluster({ auth: { authType: 'basicAuth', authData: { username: '', password: 'encoded-key' } } })]
    })!

    expect(result.clusters[0].auth).toEqual({ authType: AuthType.apiKey, authData: { apiKey: 'encoded-key' } })
  })

  it('repairs missing or broken auth data', ({ expect }) => {
    const result = migrateConnectionState({
      clusters: [
        masterCluster({ auth: { authType: 'none' } }),
        masterCluster({ auth: { authType: 'basicAuth', authData: null } }),
        masterCluster({ auth: { authType: 'awsIAM', authData: { accessKeyId: 'AKIA', region: 'eu-west-1' } } }),
        masterCluster({ auth: { authType: 'kerberos', authData: { ticket: 't' } } })
      ]
    })!

    expect(result.clusters.map((cluster: { auth: unknown }) => cluster.auth)).toEqual([
      { authType: AuthType.none, authData: {} },
      { authType: AuthType.basicAuth, authData: { username: '', password: '' } },
      { authType: AuthType.awsIAM, authData: { accessKeyId: 'AKIA', secretAccessKey: '', region: 'eu-west-1' } },
      { authType: AuthType.none, authData: {} }
    ])
  })

  it('migrates clusters stored before auth types existed', ({ expect }) => {
    const result = migrateConnectionState({
      activeClusterIndex: 0,
      clusters: [
        { name: 'basic', uri: 'http://a', username: 'elastic', password: 'pw', status: 'green' },
        { name: 'username only', uri: 'http://b', username: 'elastic', password: '' },
        { name: 'key', uri: 'http://c', username: '', password: 'encoded' },
        { name: 'none', uri: 'http://d', username: '', password: '' },
        { name: 'vuex', uri: 'http://e', version: '7.10.0', majorVersion: '7', uuid: '', status: '' }
      ]
    })!

    expect(result.clusters.map((cluster: { auth: unknown }) => cluster.auth)).toEqual([
      { authType: AuthType.basicAuth, authData: { username: 'elastic', password: 'pw' } },
      { authType: AuthType.basicAuth, authData: { username: 'elastic', password: '' } },
      { authType: AuthType.apiKey, authData: { apiKey: 'encoded' } },
      { authType: AuthType.none, authData: {} },
      { authType: AuthType.none, authData: {} }
    ])
    result.clusters.forEach((cluster: { auth: unknown }) => {
      expect(cluster).not.toHaveProperty('username')
      expect(cluster).not.toHaveProperty('password')
    })
  })

  it('migrates mixed old and new clusters independently', ({ expect }) => {
    const result = migrateConnectionState({
      clusters: [
        masterCluster({ auth: { authType: 'apiKey', authData: { apiKey: 'abc' } } }),
        { name: 'old', uri: 'http://old', username: 'elastic', password: 'pw' }
      ]
    })!

    expect(result.clusters[1].auth).toEqual({ authType: AuthType.basicAuth, authData: { username: 'elastic', password: 'pw' } })
    expect(result.clusters[1]).not.toHaveProperty('password')
  })

  it('drops entries that are not clusters', ({ expect }) => {
    const result = migrateConnectionState({
      activeClusterIndex: 0,
      clusters: [null, 'cluster', 5, masterCluster({ auth: { authType: 'none', authData: {} } })]
    })!

    expect(result.clusters).toHaveLength(1)
    expect(result.clusters[0].name).toBe('cluster')
  })

  it('handles empty and missing active clusters', ({ expect }) => {
    expect(migrateConnectionState({ clusters: [], activeClusterIndex: null })).toEqual({ clusters: [], activeClusterId: null })
    expect(migrateConnectionState({ clusters: [], activeClusterIndex: 0 })).toEqual({ clusters: [], activeClusterId: null })

    const result = migrateConnectionState({
      clusters: [masterCluster({ auth: { authType: 'none', authData: {} } })],
      activeClusterIndex: 3
    })!
    expect(result.activeClusterId).toBeNull()
  })

  it('leaves unknown data alone', ({ expect }) => {
    expect(migrateConnectionState(null)).toBeNull()
    expect(migrateConnectionState({})).toBeNull()
    expect(migrateConnectionState({ clusters: 'none' })).toBeNull()
  })

  it('keeps ids and active cluster of current data', ({ expect }) => {
    const current = {
      activeClusterId: 'b',
      clusters: [
        { ...masterCluster({ auth: { authType: 'none', authData: {} } }), id: 'a' },
        { ...masterCluster({ auth: { authType: 'apiKey', authData: { apiKey: 'k' } } }), id: 'b' }
      ]
    }

    expect(migrateConnectionState(current)).toEqual(current)
  })

  it('removes secrets of session clusters that ended up in storage', ({ expect }) => {
    const result = migrateConnectionState({
      activeClusterId: 'a',
      clusters: [
        {
          ...masterCluster({}),
          id: 'a',
          auth: { authType: 'basicAuth', authData: { username: 'admin', password: 'leaked' }, secretStorage: 'session' }
        },
        {
          ...masterCluster({}),
          id: 'b',
          auth: {
            authType: 'awsIAM',
            authData: { accessKeyId: 'AKIA', secretAccessKey: 'leaked', sessionToken: 'leaked', region: 'eu-west-1' },
            secretStorage: 'session'
          }
        }
      ]
    })!

    expect(JSON.stringify(result)).not.toContain('leaked')
    expect(result.clusters[0].auth).toEqual({
      authType: AuthType.basicAuth,
      authData: { username: 'admin', password: '' },
      secretStorage: 'session'
    })
    expect(result.clusters[1].auth.authData).toEqual({ accessKeyId: 'AKIA', secretAccessKey: '', region: 'eu-west-1' })
  })

  it('is idempotent', ({ expect }) => {
    const once = migrateConnectionState({
      activeClusterIndex: 1,
      clusters: [
        { name: 'old', uri: 'http://old', username: 'elastic', password: 'pw' },
        masterCluster({ auth: { authType: 'apiKey', authData: { apiKey: 'abc', password: 'x' } } })
      ]
    })

    expect(migrateConnectionState(once)).toEqual(once)
  })
})
