<template>
  <q-linear-progress :value="props.value / 100" :color="color" />
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ value: number }>()

const color = computed(() => {
  if (props.value >= 90) {
    return 'negative'
  } else if (props.value < 90 && props.value >= 80) {
    return 'warning'
  } else {
    return 'primary-dark'
  }
})
</script>
