<template>
  <q-linear-progress :value="numValue / 100" :color="color" />
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  const props = defineProps<{value: string}>()
  const numValue = computed(() => (parseFloat(props.value)))

  const color = computed(() => {
    if (numValue.value >= 90) {
      return 'negative'
    } else if (numValue.value < 90 && numValue.value >= 80) {
      return 'warning'
    } else {
      return 'primary-dark'
    }
  })
</script>
