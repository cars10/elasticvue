import { ref } from 'vue'
import { save } from '@tauri-apps/plugin-dialog'
import { invoke } from '@tauri-apps/api/core'
import prettyBytes from 'pretty-bytes'
import { useSnackbar } from './Snackbar'
import { buildConfig } from '../buildConfig.ts'

export const useDownload = () => {
  const { showSuccessSnackbar } = useSnackbar()
  const loading = ref(false)

  const saveFile = async (filename: string | undefined, generate: () => string | Promise<string>) => {
    const path = await save({ defaultPath: filename })
    if (!path) return

    const data = await generate()
    const result = await invoke('save_file', { path, data })
    if (typeof result === 'number') showSuccessSnackbar({ title: 'File saved', body: `${path} (${prettyBytes(result)})` })
  }

  const download = async (filename: string | undefined, generate: () => string | Promise<string>, type = 'application/json') => {
    if (buildConfig.tauri) return saveFile(filename, generate)

    loading.value = true
    const data = await generate()
    const link = document.createElement('a')
    link.href = `data:${type},${encodeURIComponent(data)}`
    link.download = filename || 'file.txt'
    document.body.appendChild(link)
    link.click()
    link.remove()
    loading.value = false
  }

  return { download, loading }
}
