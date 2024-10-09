import { writeText } from '@tauri-apps/plugin-clipboard-manager'
import { buildConfig } from '../buildConfig.ts'

export const writeToClipboard = (text: string) => {
  if (buildConfig.tauri) {
    return writeText(text)
  } else {
    return Promise.resolve(navigator.clipboard.writeText(text))
  }
}
