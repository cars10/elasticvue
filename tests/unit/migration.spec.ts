import { describe, it } from 'vitest'
import { migrateAuthType, migrateClusterIds, OldElasticsearchCluster } from '../../src/services/migrations'
import { AuthType, BuildFlavor } from '../../src/store/connection'


const oldData: OldElasticsearchCluster[] = [
  {
    'name': 'no auth',
    'username': '',
    'password': '',
    'uri': 'http://localhost:9506',
    'distribution': 'elasticsearch',
    'clusterName': '',
    'version': '6.8.2',
    'majorVersion': '6',
    'uuid': '',
    'status': '',
    'flavor': BuildFlavor.default
  },
  {
    'name': 'basic auth',
    'username': 'user',
    'password': 'pass',
    'uri': 'http://localhost:9507',
    'distribution': 'elasticsearch',
    'clusterName': '',
    'version': '7.17.22',
    'majorVersion': '7',
    'uuid': '',
    'status': '',
    'flavor': BuildFlavor.default
  },
  {
    'name': 'api key',
    'username': '',
    'password': 'apikey',
    'uri': 'http://localhost:9508',
    'distribution': 'elasticsearch',
    'clusterName': '',
    'version': '8.14.3',
    'majorVersion': '8',
    'uuid': '',
    'status': '',
    'flavor': BuildFlavor.default
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
