<template>
  <q-input v-bind="props" spellcheck="false" hide-bottom-space />
</template>

<script setup lang="ts">
  import { QInputProps } from 'quasar'

  const props = defineProps<QInputProps>()
</script>
