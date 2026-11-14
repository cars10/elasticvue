<template>
  <div>
    <q-btn
      :color="color"
      :outline="outline"
      :flat="flat"
      :round="!label"
      :dense="!label"
      :title="title"
      :disable="disable"
      :size="size"
      :loading="loading"
      @click.prevent="startDownload(props.download, props.generateDownloadData)"
    >
      <q-icon name="file_download" :class="{ 'q-mr-sm': label }" />
      {{ label }}
    </q-btn>
  </div>
</template>

<script setup lang="ts">
import { useDownload } from '../../composables/Download.ts'
import { buildConfig } from '../../buildConfig.ts'

const props = withDefaults(
  defineProps<{
    disable?: boolean
    download?: string | undefined
    label?: string
    generateDownloadData?: any
    size?: string
    color?: string
    outline?: boolean
    flat?: boolean
    title?: string
  }>(),
  {
    disable: false,
    download: buildConfig.tauri ? undefined : 'file.txt',
    label: 'Download',
    generateDownloadData: () => {},
    size: 'md',
    color: 'primary'
  }
)

const { download: startDownload, loading } = useDownload()
</script>
