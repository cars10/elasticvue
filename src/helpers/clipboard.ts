import { writeText } from '@tauri-apps/api/clipboard'
import { buildConfig } from '../config.ts'

export const writeToClipboard = (text: string) => {
  if (buildConfig.tauri) {
    return writeText(text)
  } else {
    return Promise.resolve(navigator.clipboard.writeText(text))
  }
}
