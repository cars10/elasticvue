import { invoke } from '@tauri-apps/api/core'
import { check, Update } from '@tauri-apps/plugin-updater'
import { relaunch } from '@tauri-apps/plugin-process'
import { buildConfig } from '../buildConfig.ts'
import { fetchMethod } from '../helpers/fetch.ts'
import { updateCheckUrl, versionFromResponse } from '../helpers/updateCheck.ts'
import { uuidHeader } from '../helpers/uuidHeader.ts'
import { useUpdateCheckStore } from '../store/updateCheck.ts'

let pendingUpdate: Update | null = null

const fetchAvailableVersion = async (): Promise<string | null> => {
  if (buildConfig.tauri) {
    pendingUpdate = await check({ headers: uuidHeader() })
    return pendingUpdate?.version ?? null
  }

  const url = updateCheckUrl({
    version: __APP_VERSION__,
    buildMode: buildConfig.buildMode,
    variant: buildConfig.variant,
    userAgent: navigator.userAgent
  })
  const response = await fetchMethod(url, { headers: uuidHeader() })
  const body = response.status === 200 ? await response.text() : ''
  return versionFromResponse(response.status, body)
}

export const checkForUpdate = async () => {
  const store = useUpdateCheckStore()
  if (store.status === 'checking') return

  store.status = 'checking'
  try {
    const version = await fetchAvailableVersion()
    store.availableVersion = version
    store.status = version ? 'available' : 'up_to_date'
    store.lastCheckedAt = Date.now()
  } catch (_e) {
    store.status = 'failed'
  }
}

export const startUpdateCheck = async () => {
  const store = useUpdateCheckStore()
  if (buildConfig.tauri) store.selfUpdateSupported = await invoke<boolean>('self_update_supported').catch(() => false)
  if (!store.autoCheck) return

  await checkForUpdate()
  if (store.notify && store.selfUpdateSupported) store.dialog = true
}

export const installUpdate = async () => {
  const store = useUpdateCheckStore()
  if (!pendingUpdate || !store.selfUpdateSupported) return

  let downloaded = 0
  let contentLength = 0

  store.installError = ''
  store.downloadProgress = null
  store.installState = 'downloading'

  try {
    await pendingUpdate.downloadAndInstall((event) => {
      switch (event.event) {
        case 'Started':
          contentLength = event.data.contentLength || 0
          break
        case 'Progress':
          downloaded += event.data.chunkLength
          store.downloadProgress = contentLength > 0 ? Math.min(downloaded / contentLength, 1) : null
          break
        case 'Finished':
          store.installState = 'installing'
          break
      }
    })

    await relaunch()
  } catch (e) {
    store.installError = e instanceof Error ? e.message : String(e)
    store.installState = 'failed'
  }
}
