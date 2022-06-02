import { DESKTOP_BUILD } from '@/consts'
import { confirm } from '@tauri-apps/api/dialog'

export const confirmMethod = DESKTOP_BUILD ? confirm : window.confirm
