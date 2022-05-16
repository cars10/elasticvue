<template>
  <div>
    <v-btn :disabled="disabled"
           :small="small"
           :download="download"
           :href="href"
           @click="downloadData">
      {{ text }}
    </v-btn>

    <file-chooser v-if="DESKTOP_BUILD"
                  v-model="dialog"
                  :initial-file-name="download"
                  :generate-download-data="generateDownloadData"/>
  </div>
</template>

<script>
  import { ref } from '@vue/composition-api'
  import { DESKTOP_BUILD } from '@/consts'
  import FileChooser from '@/components/shared/DownloadButton/FileChooser'

  export default {
    name: 'download-button',
    components: {
      FileChooser
    },
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
      const dialog = ref(false)

      const setDownloadHref = () => {
        href.value = `data:application/json,${encodeURIComponent(props.generateDownloadData())}`
      }
      const downloadData = () => {
        if (DESKTOP_BUILD) {
          dialog.value = true
        } else {
          setDownloadHref()
        }
      }

      return {
        downloadData,
        href,
        dialog,
        DESKTOP_BUILD
      }
    }
  }
</script>
