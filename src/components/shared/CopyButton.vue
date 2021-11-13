<template>
  <v-btn icon :small="small" @click.stop="copy" :title="title">
    <v-icon :small="small">{{ icon }}</v-icon>
  </v-btn>
</template>

<script>
  import { ref } from '@vue/composition-api'

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
      }
    },
    setup (props) {
      const icon = ref('mdi-content-copy')
      const copy = () => {
        icon.value = 'mdi-check'
        navigator.clipboard.writeText(props.value)
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
