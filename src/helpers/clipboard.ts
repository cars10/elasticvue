import { readText, writeText } from '@tauri-apps/plugin-clipboard-manager'
import { buildConfig } from '../buildConfig.ts'

export const writeToClipboard = (text: string) => {
  if (buildConfig.tauri) {
    return writeText(text)
  } else {
    return Promise.resolve(navigator.clipboard.writeText(text))
  }
}

export const readFromClipboard = () => {
  if (buildConfig.tauri) {
    return readText()
  }
  return navigator.clipboard.readText()
}

export function installTauriNavigatorClipboardShim() {
  if (!buildConfig.tauri) return
  try {
    const clip = navigator.clipboard
    if (!clip) return
    Object.defineProperty(clip, 'writeText', {
      value: (text: string) => writeText(text),
      configurable: true,
      enumerable: true,
      writable: true
    })
    Object.defineProperty(clip, 'readText', {
      value: () => readText(),
      configurable: true,
      enumerable: true,
      writable: true
    })
  } catch {}
}
