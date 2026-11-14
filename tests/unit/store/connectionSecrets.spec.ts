import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchMethod } from '../../../src/helpers/fetch'
import { checkHealth } from '../../../src/composables/components/home/ClusterHealth'
import { createApp, nextTick } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { AuthType, BuildFlavor, ElasticsearchClusterAuth, SecretStorage, useConnectionStore } from '../../../src/store/connection'
import { needsCredentials, useSessionCredentials, withSessionCredentials } from '../../../src/store/sessionCredentials'
import { removeClusterStorage } from '../../../src/helpers/clusterStorage'

vi.mock('../../../src/helpers/fetch', () => ({ fetchMethod: vi.fn() }))
vi.mock('../../../src/helpers/clusterStorage', () => ({ removeClusterStorage: vi.fn() }))

const memoryStorage = () => {
  let data: Record<string, string> = {}
  return {
    getItem: (key: string) => data[key] ?? null,
    setItem: (key: string, value: string) => (data[key] = value),
    removeItem: (key: string) => delete data[key],
    clear: () => (data = {})
  }
}

const cluster = (auth: object) => ({
  name: 'cluster',
  uri: 'http://localhost:9200',
  clusterName: '',
  version: '8.15.0',
  majorVersion: '8',
  distribution: 'elasticsearch',
  status: 'green',
  flavor: BuildFlavor.default,
  auth: auth as ElasticsearchClusterAuth
})

const persisted = async (key: string, storage: Storage) => {
  await nextTick()
  return JSON.parse(storage.getItem(key) || 'null')
}

describe('connection store secrets', () => {
  beforeEach(() => {
    const local = memoryStorage()
    vi.stubGlobal('localStorage', local)
    vi.stubGlobal('sessionStorage', memoryStorage())
    vi.stubGlobal('window', { localStorage: local })
    const pinia = createPinia().use(piniaPluginPersistedstate)
    createApp({}).use(pinia)
    setActivePinia(pinia)
  })

  it('keeps session secrets out of local storage for every auth type', async () => {
    const store = useConnectionStore()
    const basic = store.addCluster(
      cluster({
        authType: AuthType.basicAuth,
        authData: { username: 'admin', password: 'pw-secret' },
        secretStorage: SecretStorage.session
      })
    )
    const apiKey = store.addCluster(
      cluster({ authType: AuthType.apiKey, authData: { apiKey: 'key-secret' }, secretStorage: SecretStorage.session })
    )
    const aws = store.addCluster(
      cluster({
        authType: AuthType.awsIAM,
        authData: { accessKeyId: 'AKIA', secretAccessKey: 'aws-secret', sessionToken: 'token-secret', region: 'eu-west-1' },
        secretStorage: SecretStorage.session
      })
    )

    const local = JSON.stringify(await persisted('connection', localStorage))
    expect(local).not.toMatch(/pw-secret|key-secret|aws-secret|token-secret/)
    expect(local).toContain('admin')
    expect(local).toContain('AKIA')
    expect(JSON.stringify(store.$state)).not.toMatch(/pw-secret|key-secret|aws-secret|token-secret/)

    const session = await persisted('sessionCredentials', sessionStorage)
    expect(session.byId[basic]).toEqual({ password: 'pw-secret' })
    expect(session.byId[apiKey]).toEqual({ apiKey: 'key-secret' })
    expect(session.byId[aws]).toEqual({ secretAccessKey: 'aws-secret', sessionToken: 'token-secret' })

    expect(withSessionCredentials(store.clusterById(aws)!).auth.authData).toEqual({
      accessKeyId: 'AKIA',
      secretAccessKey: 'aws-secret',
      sessionToken: 'token-secret',
      region: 'eu-west-1'
    })
  })

  it('stores secrets locally by default', async () => {
    const store = useConnectionStore()
    store.addCluster(cluster({ authType: AuthType.basicAuth, authData: { username: 'elastic', password: 'pw' } }))

    const local = await persisted('connection', localStorage)
    expect(local.clusters[0].auth).toEqual({ authType: AuthType.basicAuth, authData: { username: 'elastic', password: 'pw' } })
    expect(useSessionCredentials().byId).toEqual({})
  })

  it('does not store leftovers of other auth types', async () => {
    const store = useConnectionStore()
    store.addCluster(
      cluster({ authType: AuthType.apiKey, authData: { username: 'elastic', password: 'leftover', apiKey: 'key' } })
    )

    expect(JSON.stringify(await persisted('connection', localStorage))).not.toContain('leftover')
  })

  it('asks for credentials when no session secret exists', () => {
    const store = useConnectionStore()
    const credentials = useSessionCredentials()
    const id = store.addCluster(
      cluster({ authType: AuthType.apiKey, authData: { apiKey: 'key' }, secretStorage: SecretStorage.session })
    )

    expect(needsCredentials(store.clusterById(id)!)).toBe(false)
    credentials.remove(id)
    expect(needsCredentials(store.clusterById(id)!)).toBe(true)
  })

  it('updates session secrets when editing', () => {
    const store = useConnectionStore()
    const credentials = useSessionCredentials()
    const id = store.addCluster(
      cluster({
        authType: AuthType.basicAuth,
        authData: { username: 'a', password: 'one' },
        secretStorage: SecretStorage.session
      })
    )
    const edit = (auth: object) =>
      store.updateCluster({
        id,
        cluster: { name: 'cluster', uri: 'http://localhost:9200', auth: auth as ElasticsearchClusterAuth }
      })

    edit({ authType: AuthType.basicAuth, authData: { username: 'a', password: 'two' }, secretStorage: SecretStorage.session })
    expect(credentials.byId[id]).toEqual({ password: 'two' })

    edit({ authType: AuthType.basicAuth, authData: { username: 'b', password: '' }, secretStorage: SecretStorage.session })
    expect(credentials.byId[id]).toBeUndefined()

    edit({ authType: AuthType.basicAuth, authData: { username: 'b', password: 'three' }, secretStorage: SecretStorage.local })
    expect(credentials.byId[id]).toBeUndefined()
    expect(store.clusterById(id)!.auth).toEqual({ authType: AuthType.basicAuth, authData: { username: 'b', password: 'three' } })
  })

  it('applies session usernames without storing them', async () => {
    const store = useConnectionStore()
    const credentials = useSessionCredentials()
    const id = store.addCluster(
      cluster({
        authType: AuthType.basicAuth,
        authData: { username: 'reader', password: '' },
        secretStorage: SecretStorage.session
      })
    )
    credentials.set(id, { username: 'admin', password: 'pw' })

    expect(withSessionCredentials(store.clusterById(id)!).auth.authData).toEqual({ username: 'admin', password: 'pw' })
    expect((await persisted('connection', localStorage)).clusters[0].auth.authData).toEqual({ username: 'reader', password: '' })
  })

  it('strips session secrets even when state is changed directly', async () => {
    const store = useConnectionStore()
    const id = store.addCluster(
      cluster({ authType: AuthType.apiKey, authData: { apiKey: '' }, secretStorage: SecretStorage.session })
    )
    ;(store.clusterById(id)!.auth.authData as { apiKey: string }).apiKey = 'direct-secret'

    expect(JSON.stringify(await persisted('connection', localStorage))).not.toContain('direct-secret')
  })

  it('forgets session secrets and stored data of removed clusters', () => {
    const store = useConnectionStore()
    const id = store.addCluster(
      cluster({ authType: AuthType.apiKey, authData: { apiKey: 'key' }, secretStorage: SecretStorage.session })
    )
    store.removeCluster(id)

    expect(useSessionCredentials().byId).toEqual({})
    expect(removeClusterStorage).toHaveBeenCalledWith(id)
  })
})

describe('health checks with session credentials', () => {
  const respond = (status: number, body: object) => ({
    ok: status < 400,
    status,
    statusText: '',
    headers: { get: () => null },
    text: () => Promise.resolve(JSON.stringify(body))
  })
  const ping = { cluster_name: 'es', cluster_uuid: 'u', version: { number: '8.15.0' } }

  beforeEach(() => {
    const local = memoryStorage()
    vi.stubGlobal('localStorage', local)
    vi.stubGlobal('sessionStorage', memoryStorage())
    vi.stubGlobal('window', { localStorage: local })
    const pinia = createPinia().use(piniaPluginPersistedstate)
    createApp({}).use(pinia)
    setActivePinia(pinia)
    vi.mocked(fetchMethod).mockReset()
  })

  const sessionCluster = () => {
    const store = useConnectionStore()
    const id = store.addCluster(
      cluster({ authType: AuthType.basicAuth, authData: { username: 'a', password: 'pw' }, secretStorage: SecretStorage.session })
    )
    return store.clusterById(id)!
  }

  it('forgets credentials that the cluster rejects', async () => {
    vi.mocked(fetchMethod).mockResolvedValue(respond(401, {}))
    const saved = sessionCluster()

    await checkHealth(saved)

    expect(needsCredentials(saved)).toBe(true)
    expect(saved.status).toBe('unknown')
  })

  it('keeps credentials when only the health request is forbidden', async () => {
    vi.mocked(fetchMethod).mockResolvedValueOnce(respond(200, ping)).mockResolvedValueOnce(respond(403, {}))
    const saved = sessionCluster()

    await checkHealth(saved)

    expect(needsCredentials(saved)).toBe(false)
    expect(saved.status).toBe('unknown')
  })

  it('sends the session password', async () => {
    vi.mocked(fetchMethod)
      .mockResolvedValueOnce(respond(200, ping))
      .mockResolvedValueOnce(respond(200, { status: 'green' }))
    const saved = sessionCluster()

    await checkHealth(saved)

    const headers = vi.mocked(fetchMethod).mock.calls[0][1]?.headers as Record<string, string>
    expect(headers.Authorization).toBe(`Basic ${btoa('a:pw')}`)
    expect(saved.status).toBe('green')
  })

  it('does not send requests without credentials', async () => {
    const saved = sessionCluster()
    useSessionCredentials().remove(saved.id)

    await checkHealth(saved)

    expect(fetchMethod).not.toHaveBeenCalled()
  })

  it('describes why the cluster is not usable', async () => {
    const saved = sessionCluster()

    vi.mocked(fetchMethod).mockResolvedValueOnce(
      respond(503, { error: { type: 'master_not_discovered_exception', reason: 'no master' } })
    )
    expect((await checkHealth(saved)).error).toEqual({ status: 503, message: '503: no master' })

    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    vi.mocked(fetchMethod).mockRejectedValueOnce(new TypeError('Failed to fetch'))
    expect((await checkHealth(saved)).error).toEqual({ status: 0, message: 'Failed to fetch', cors: false })

    vi.mocked(fetchMethod)
      .mockResolvedValueOnce(respond(200, ping))
      .mockResolvedValueOnce(respond(200, { status: 'green' }))
    expect((await checkHealth(saved)).error).toBeNull()
  })
})
