import { DESKTOP_BUILD } from '@/consts'
import { confirm } from '@tauri-apps/api/dialog'

export const askConfirm = msg => {
  if (DESKTOP_BUILD) {
    return confirm(msg)
  } else {
    return Promise.resolve(window.confirm(msg))
  }
}
