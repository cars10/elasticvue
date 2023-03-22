<template>
  <q-linear-progress :value="value / 100" :color="color" />
</template>

<script setup>
  import { computed } from 'vue'

  const props = defineProps({
    value: {
      type: [String, Number],
      default: 0
    }
  })

  const color = computed(() => {
    const numberValue = parseFloat(props.value)
    if (numberValue >= 90) {
      return 'negative'
    } else if (numberValue < 90 && numberValue >= 80) {
      return 'warning'
    } else {
      return 'primary-dark'
    }
  })
</script>
