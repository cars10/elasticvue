import { beforeEach, describe, expect, it, vi } from 'vitest'
import { deserializeConnection, needsPassword, serializeConnection } from '../../../src/services/SessionPasswords'
import { AuthType, BuildFlavor, ConnectionState, ElasticsearchCluster } from '../../../src/store/connection'

const buildCluster = (auth: ElasticsearchCluster['auth']): ElasticsearchCluster => ({
  name: 'cluster',
  uri: 'http://localhost:9200',
  clusterName: '',
  version: '',
  majorVersion: '',
  distribution: '',
  uuid: '',
  status: '',
  flavor: BuildFlavor.default,
  auth
})

const savedCluster = buildCluster({ authType: AuthType.basicAuth, authData: { username: 'saved', password: 'secret' } })
const promptCluster = buildCluster({
  authType: AuthType.basicAuth,
  authData: { username: 'admin', password: 'secret', promptPassword: true }
})

const fakeStorage = () => {
  const data = new Map<string, string>()
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => data.set(key, value),
    clear: () => data.clear()
  }
}

describe('SessionPasswords', () => {
  beforeEach(() => vi.stubGlobal('sessionStorage', fakeStorage()))

  it('keeps passwords of normal clusters in the serialized state', () => {
    const state: ConnectionState = { clusters: [savedCluster], activeClusterIndex: 0 }
    const serialized = JSON.parse(serializeConnection(state))

    expect(serialized.clusters[0].auth.authData.password).toBe('secret')
  })

  it('removes passwords of prompt clusters from the serialized state', () => {
    const state: ConnectionState = { clusters: [promptCluster], activeClusterIndex: 0 }
    const serialized = serializeConnection(state)

    expect(serialized).not.toContain('secret')
    expect(JSON.parse(serialized).clusters[0].auth.authData).toEqual({
      username: 'admin',
      password: '',
      promptPassword: true
    })
  })

  it('does not change the state it serializes', () => {
    serializeConnection({ clusters: [promptCluster], activeClusterIndex: 0 })

    expect(promptCluster.auth.authData).toHaveProperty('password', 'secret')
  })

  it('restores prompt passwords from the session', () => {
    const serialized = serializeConnection({ clusters: [promptCluster, savedCluster], activeClusterIndex: 0 })
    const state = deserializeConnection(serialized)

    expect(state.clusters[0].auth.authData).toHaveProperty('password', 'secret')
    expect(state.clusters[1].auth.authData).toHaveProperty('password', 'secret')
  })

  it('needs the password again once the session is gone', () => {
    const serialized = serializeConnection({ clusters: [promptCluster], activeClusterIndex: 0 })
    sessionStorage.clear()
    const state = deserializeConnection(serialized)

    expect(state.clusters[0].auth.authData).toHaveProperty('password', '')
    expect(needsPassword(state.clusters[0])).toBe(true)
  })

  it('needs a password only for prompt clusters without one', () => {
    const emptyPrompt = buildCluster({
      authType: AuthType.basicAuth,
      authData: { username: 'admin', password: '', promptPassword: true }
    })

    expect(needsPassword(emptyPrompt)).toBe(true)
    expect(needsPassword(promptCluster)).toBe(false)
    expect(needsPassword(savedCluster)).toBe(false)
    expect(needsPassword(buildCluster({ authType: AuthType.none, authData: {} }))).toBe(false)
  })
})
