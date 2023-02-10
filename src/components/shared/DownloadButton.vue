<template>
  <q-btn :disable="disable"
         :download="download"
         :href="href"
         @click="downloadData">
    <q-icon name="file_download" class="q-mr-sm" />
    {{ label }}
  </q-btn>
</template>

<script setup>
  import { ref } from 'vue'
  import { save } from '@tauri-apps/api/dialog'
  import { invoke } from '@tauri-apps/api/tauri'
  import prettyBytes from 'pretty-bytes'
  import { DESKTOP_BUILD } from '../../consts'
  import { useSnackbar } from '../../composables/Snackbar'

  const props = defineProps({
    disable: {
      type: Boolean,
      default: false
    },
    download: {
      type: String,
      default: DESKTOP_BUILD ? null : 'file.txt'
    },
    label: {
      type: String,
      default: 'Download'
    },
    generateDownloadData: {
      type: Function,
      default: () => {
      }
    }
  })

  const { showSuccessSnackbar } = useSnackbar()
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
</script>
