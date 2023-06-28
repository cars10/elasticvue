import { confirm } from '@tauri-apps/api/dialog'
import { buildConfig } from '../config.ts'

export const askConfirm = (msg: string) => {
  if (buildConfig.tauri) {
    return confirm(msg)
  } else {
    return Promise.resolve(window.confirm(msg))
  }
}
