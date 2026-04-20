import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Mock } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import {
  AuthType,
  BuildFlavor,
  useConnectionStore,
  type ElasticsearchCluster,
  type ElasticsearchClusterConnection
} from '../../../src/store/connection'
import { useElasticsearchAdapter } from '../../../src/composables/CallElasticsearch'
import type { ElasticsearchMethod } from '../../../src/services/ElasticsearchAdapter'

const { adapterCallMock, adapterPingMock, adapterConstructorMock, resolveConnectionForAdapterMock } = vi.hoisted(() => {
  const adapterCall = vi.fn().mockResolvedValue(undefined)
  const adapterPing = vi.fn().mockResolvedValue(undefined)
  const adapterConstructor = vi.fn(function (this: { call: Mock; ping: Mock }) {
    this.call = adapterCall
    this.ping = adapterPing
  })
  const resolveConnectionForAdapter = vi.fn(async (connection: ElasticsearchClusterConnection) => connection)
  return {
    adapterCallMock: adapterCall,
    adapterPingMock: adapterPing,
    adapterConstructorMock: adapterConstructor,
    resolveConnectionForAdapterMock: resolveConnectionForAdapter
  }
})

vi.mock('../../../src/services/ElasticsearchAdapter', () => ({
  default: adapterConstructorMock
}))

vi.mock('../../../src/helpers/awsCredentials.ts', () => ({
  resolveConnectionForAdapter: resolveConnectionForAdapterMock
}))

const createCluster = (auth: ElasticsearchCluster['auth']): ElasticsearchCluster => ({
  clusterName: 'cluster',
  version: '8.0.0',
  majorVersion: '8',
  distribution: 'elasticsearch',
  uuid: 'uuid',
  status: 'green',
  flavor: BuildFlavor.default,
  name: 'cluster',
  uri: 'http://localhost:9200',
  auth
})

const pingMethod: ElasticsearchMethod = 'ping'

describe('CallElasticsearch', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    adapterCallMock.mockClear()
    adapterPingMock.mockClear()
    adapterConstructorMock.mockClear()
    resolveConnectionForAdapterMock.mockClear()
  })

  it('re-resolves profile credentials for each request', async () => {
    const store = useConnectionStore()
    store.clusters = [
      createCluster({
        authType: AuthType.awsIAM,
        authData: {
          awsCredentialType: 'profile',
          profileName: 'default'
        }
      })
    ]
    store.activeClusterIndex = 0

    const { callElasticsearch } = useElasticsearchAdapter()
    await callElasticsearch(pingMethod)
    await callElasticsearch(pingMethod)

    expect(resolveConnectionForAdapterMock).toHaveBeenCalledTimes(2)
    expect(adapterConstructorMock).toHaveBeenCalledTimes(2)
    expect(adapterPingMock).not.toHaveBeenCalled()
  })

  it('keeps singleton adapter behavior for non-profile auth', async () => {
    const store = useConnectionStore()
    store.clusters = [
      createCluster({
        authType: AuthType.awsIAM,
        authData: {
          awsCredentialType: 'basic',
          accessKeyId: 'AKIA',
          secretAccessKey: 'SECRET',
          region: 'eu-west-1'
        }
      })
    ]
    store.activeClusterIndex = 0

    const { callElasticsearch } = useElasticsearchAdapter()
    await callElasticsearch(pingMethod)
    await callElasticsearch(pingMethod)

    expect(resolveConnectionForAdapterMock).toHaveBeenCalledTimes(1)
    expect(adapterConstructorMock).toHaveBeenCalledTimes(1)
    expect(adapterPingMock).toHaveBeenCalledTimes(1)
  })
})
