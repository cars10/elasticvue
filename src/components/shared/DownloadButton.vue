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

<script setup lang="ts">
  import { ref, nextTick, Ref } from 'vue'
  import { save } from '@tauri-apps/plugin-dialog'
  import { invoke } from '@tauri-apps/api/core'
  import prettyBytes from 'pretty-bytes'
  import { useSnackbar } from '../../composables/Snackbar'
  import { buildConfig } from '../../buildConfig.ts'

  const props = withDefaults(defineProps<{
    disable?: boolean,
    download?: string | undefined,
    label?: string,
    generateDownloadData?: any,
    size?: string,
    color?: string
  }>(), {
    disable: false,
    download: buildConfig.tauri ? undefined : 'file.txt',
    label: 'Download',
    generateDownloadData: () => {
    },
    size: 'md',
    color: 'primary'
  })

  const { showSuccessSnackbar } = useSnackbar()
  const href = ref('')
  const loading = ref(false)
  const downloadLink: Ref<HTMLAnchorElement | null> = ref(null)

  const downloadData = () => {
    if (buildConfig.tauri) {
      save({ defaultPath: props.download }).then(path => {
        if (path) saveFile(path)
      })
    } else {
      setDownloadHref()
    }
  }

  const saveFile = async (path: string) => {
    const data = await props.generateDownloadData()
    invoke('save_file', { path, data }).then(result => {
      if (typeof result === 'number') {
        showSuccessSnackbar({ title: 'File saved', body: `${path} (${prettyBytes(result)})` })
      }
    })
  }

  const setDownloadHref = async () => {
    loading.value = true
    href.value = ''

    const data = await props.generateDownloadData()

    href.value = `data:application/json,${encodeURIComponent(data)}`
    loading.value = false

    nextTick(() => {
      if (downloadLink.value) downloadLink.value.click()
    })
  }
</script>
