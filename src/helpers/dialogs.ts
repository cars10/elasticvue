import { confirm } from '@tauri-apps/plugin-dialog'
import { buildConfig } from '../buildConfig.ts'

export const askConfirm = (msg: string) => {
  if (buildConfig.tauri) {
    return confirm(msg)
  } else {
    return Promise.resolve(window.confirm(msg))
  }
}
