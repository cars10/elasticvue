import { DESKTOP_BUILD } from '@/consts'
import { writeText } from '@tauri-apps/api/clipboard'

export const writeToClipboard = text => {
  if (DESKTOP_BUILD) {
    return writeText(text)
  } else {
    return Promise.resolve(navigator.clipboard.writeText(text))
  }
}
