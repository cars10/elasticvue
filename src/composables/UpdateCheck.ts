import { Ref, ref } from 'vue'
import { check, Update } from '@tauri-apps/plugin-updater'
import { relaunch } from '@tauri-apps/plugin-process'

type UpdateInfo = {
  version: string
}

export const useUpdateCheck = () => {
  const dialog = ref(false)
  const downloading = ref(false)
  const downloadProgress = ref(0)
  const installing = ref(false)
  const updateInfo: Ref<UpdateInfo | null> = ref(null)
  let update: Update | null = null

  const checkUpdate = async () => {
    update = await check()

    if (update) {
      updateInfo.value = { version: update.version }
      dialog.value = true
    } else {
      updateInfo.value = null
    }
  }

  const downloadUpdate = async () => {
    if (!update) return

    let downloaded = 0
    let contentLength = 0

    downloading.value = true

    await update.downloadAndInstall((event) => {
      switch (event.event) {
        case 'Started':
          contentLength = event.data.contentLength || -1
          break
        case 'Progress':
          downloaded += event.data.chunkLength
          downloadProgress.value = downloaded / contentLength
          break
        case 'Finished':
          downloading.value = false
          installing.value = true
          break
      }
    })

    await relaunch()
  }

  return {
    checkUpdate,
    downloadUpdate,
    dialog,
    downloading,
    downloadProgress,
    installing,
    updateInfo
  }
}