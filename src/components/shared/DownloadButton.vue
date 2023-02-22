<template>
  <div>
    <q-btn :color="color"
           :disable="disable"
           :size="size"
           :loading="loading"
           @click.prevent="downloadData">
      <q-icon name="file_download" class="q-mr-sm" />
      {{ label }}
    </q-btn>
    <a ref="downloadLink" :download="download" :href="href" class="hidden" />
  </div>
</template>

<script setup>
  import { ref, nextTick } from 'vue'
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
    },
    size: {
      type: String,
      default: 'md'
    },
    color: {
      type: String,
      default: 'primary'
    }
  })

  const { showSuccessSnackbar } = useSnackbar()
  const href = ref('')
  const loading = ref(false)
  const downloadLink = ref(null)

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

  const setDownloadHref = async e => {
    loading.value = true
    href.value = ''

    const data = await props.generateDownloadData()

    href.value = `data:application/json,${encodeURIComponent(data)}`
    loading.value = false

    nextTick(() => (downloadLink.value.click()))
  }
</script>
