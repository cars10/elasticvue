<template>
  <q-input v-bind="props" spellcheck="false" hide-bottom-space>
    <template v-if="slots.hint" #hint>
      <slot name="hint" />
    </template>
  </q-input>
</template>

<script setup lang="ts">
  import { QInputProps } from 'quasar'
  import { useSlots } from 'vue'

  const slots = useSlots()
  const props = defineProps<QInputProps>()
</script>
