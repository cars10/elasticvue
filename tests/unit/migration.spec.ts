import { describe, it } from 'vitest'
import { migrateAuthType, OldElasticsearchCluster } from '../../src/services/migrations'
import { AuthType, BuildFlavor } from "../../src/store/connection";


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
