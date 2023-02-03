<template>
  <q-btn :icon="icon" @click="copy" />
</template>

<script setup>
  import { ref } from 'vue'
  import { writeToClipboard } from '../../helpers/clipboard'

  const props = defineProps({
    value: {
      default: '',
      type: String
    },
    customHandler: {
      default: null,
      type: [Function, Object]
    }
  })

  const icon = ref('content_copy')
  const copy = () => {
    icon.value = 'done'

    if (props.customHandler) {
      props.customHandler.call()
    } else {
      writeToClipboard(props.value)
    }
    setTimeout(() => {
      icon.value = 'content_copy'
    }, 1000)
  }
</script>
