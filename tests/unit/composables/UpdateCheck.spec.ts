import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { fetchMethod } from '../../../src/helpers/fetch'
import { checkForUpdate, installUpdate, startUpdateCheck } from '../../../src/composables/UpdateCheck'
import { useUpdateCheckStore } from '../../../src/store/updateCheck'

vi.mock('../../../src/helpers/fetch', () => ({ fetchMethod: vi.fn() }))
vi.mock('../../../src/helpers/uuidHeader', () => ({ uuidHeader: () => ({}) }))
vi.mock('@tauri-apps/api/core', () => ({ invoke: vi.fn() }))
vi.mock('@tauri-apps/plugin-updater', () => ({ check: vi.fn() }))
vi.mock('@tauri-apps/plugin-process', () => ({ relaunch: vi.fn() }))

const respond = (status: number, body = '') => {
  vi.mocked(fetchMethod).mockResolvedValue({
    ok: status < 400,
    status,
    statusText: '',
    headers: { get: () => null },
    text: () => Promise.resolve(body)
  })
}

describe('composables/UpdateCheck.ts', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.mocked(fetchMethod).mockReset()
  })

  it('reports an available version', async () => {
    respond(200, '{"version":"99.0.0"}')
    const store = useUpdateCheckStore()

    await checkForUpdate()

    expect(store.status).toBe('available')
    expect(store.availableVersion).toBe('99.0.0')
    expect(store.lastCheckedAt).not.toBeNull()
    expect(store.notify).toBe(true)
  })

  it('reports up to date for 204', async () => {
    respond(204)
    const store = useUpdateCheckStore()

    await checkForUpdate()

    expect(store.status).toBe('up_to_date')
    expect(store.availableVersion).toBeNull()
    expect(store.notify).toBe(false)
  })

  it('reports a failed check for error responses', async () => {
    respond(500)
    const store = useUpdateCheckStore()

    await checkForUpdate()

    expect(store.status).toBe('failed')
    expect(store.lastCheckedAt).toBeNull()
    expect(store.notify).toBe(false)
  })

  it('reports a failed check for network errors', async () => {
    vi.mocked(fetchMethod).mockRejectedValue(new TypeError('Failed to fetch'))
    const store = useUpdateCheckStore()

    await expect(checkForUpdate()).resolves.toBeUndefined()

    expect(store.status).toBe('failed')
  })

  it('recovers after a failed check', async () => {
    respond(500)
    const store = useUpdateCheckStore()
    await checkForUpdate()

    respond(200, '{"version":"99.0.0"}')
    await checkForUpdate()

    expect(store.status).toBe('available')
  })

  it('does not notify about a skipped version', async () => {
    respond(200, '{"version":"99.0.0"}')
    const store = useUpdateCheckStore()
    store.skippedVersion = '99.0.0'

    await checkForUpdate()

    expect(store.status).toBe('available')
    expect(store.skipped).toBe(true)
    expect(store.notify).toBe(false)
  })

  it('notifies again when a newer version than the skipped one appears', async () => {
    respond(200, '{"version":"99.1.0"}')
    const store = useUpdateCheckStore()
    store.skippedVersion = '99.0.0'

    await checkForUpdate()

    expect(store.notify).toBe(true)
  })

  it('skips and unskips the available version', async () => {
    respond(200, '{"version":"99.0.0"}')
    const store = useUpdateCheckStore()
    await checkForUpdate()

    store.dialog = true
    store.skip()
    expect(store.skippedVersion).toBe('99.0.0')
    expect(store.dialog).toBe(false)
    expect(store.notify).toBe(false)

    store.unskip()
    expect(store.notify).toBe(true)
  })

  it('checks on startup by default', async () => {
    respond(200, '{"version":"99.0.0"}')
    const store = useUpdateCheckStore()

    await startUpdateCheck()

    expect(fetchMethod).toHaveBeenCalledTimes(1)
    expect(store.status).toBe('available')
  })

  it('sends no request on startup when the automatic check is disabled', async () => {
    const store = useUpdateCheckStore()
    store.autoCheck = false

    await startUpdateCheck()

    expect(fetchMethod).not.toHaveBeenCalled()
    expect(store.status).toBe('idle')
  })

  it('never opens the install dialog or installs outside the desktop app', async () => {
    respond(200, '{"version":"99.0.0"}')
    const store = useUpdateCheckStore()

    await startUpdateCheck()
    await installUpdate()

    expect(store.selfUpdateSupported).toBe(false)
    expect(store.dialog).toBe(false)
    expect(store.installState).toBe('idle')
    expect(store.mode).toBe('manual')
  })
})
