<template>
  <v-btn :disabled="disabled"
         :small="small"
         :download="download"
         :href="href"
         @click="downloadData">
    {{ text }}
  </v-btn>
</template>

<script>
  import { DESKTOP_BUILD } from '@/consts'
  import { showSuccessSnackbar } from '@/mixins/ShowSnackbar'
  import { ref } from 'vue'
  import { save } from '@tauri-apps/api/dialog'
  import { invoke } from '@tauri-apps/api/tauri'
  import prettyBytes from 'pretty-bytes'

  export default {
    name: 'download-button',
    props: {
      disabled: {
        type: Boolean,
        default: false
      },
      download: {
        type: String,
        default: DESKTOP_BUILD ? null : 'file.txt'
      },
      small: {
        type: Boolean,
        default: false
      },
      text: {
        type: String,
        default: 'Download'
      },
      generateDownloadData: {
        type: Function,
        default: () => {
        }
      }
    },
    setup (props) {
      const href = ref(DESKTOP_BUILD ? null : '#')

      const downloadData = () => {
        if (DESKTOP_BUILD) {
          save({ defaultPath: props.download }).then(path => {
            if (path) saveFile(path)
          })
        } else {
          setDownloadHref()
        }
      }

      const saveFile = async path => {
        const data = await props.generateDownloadData()
        invoke('save_file', { path, data }).then(result => {
          if (typeof result === 'number') {
            showSuccessSnackbar({ title: 'File saved', body: `${path} (${prettyBytes(result)})` })
          }
        })
      }

      const setDownloadHref = async () => {
        const data = await props.generateDownloadData()
        href.value = `data:application/json,${encodeURIComponent(data)}`
      }

      return {
        downloadData,
        href
      }
    }
  }
</script>
