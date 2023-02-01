<template>
  <v-btn icon :small="small" @click.stop="copy" :title="title">
    <v-icon :small="small">{{ icon }}</v-icon>
  </v-btn>
</template>

<script>
  import { ref } from 'vue'
  import { writeToClipboard } from '@/services/tauri/clipboard'

  export default {
    name: 'copy-button',
    props: {
      title: {
        default: '',
        type: String
      },
      value: {
        default: '',
        type: String
      },
      small: {
        default: false,
        type: Boolean
      },
      customHandler: {
        default: null,
        type: [Function, Object]
      }
    },
    setup (props) {
      const icon = ref('mdi-content-copy')
      const copy = () => {
        icon.value = 'mdi-check'

        if (props.customHandler) {
          props.customHandler.call()
        } else {
          writeToClipboard(props.value)
        }
        setTimeout(() => {
          icon.value = 'mdi-content-copy'
        }, 1000)
      }

      return {
        copy,
        icon
      }
    }
  }
</script>
