import { register, unregisterAll } from '@tauri-apps/plugin-global-shortcut'
import { onMounted, onUnmounted } from 'vue'

export function useZoomShortcuts(resetZoom: () => void) {
  onMounted( async () => {
    await register('CommandOrControl+Numpad0', resetZoom)
  })

  onUnmounted(async () => {
    await unregisterAll()
  })
}
