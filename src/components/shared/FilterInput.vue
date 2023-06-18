<template>
  <q-input v-model="filter" :label="t('defaults.filter.label')" dense outlined name="filter" @keyup.esc="filter = ''">
    <template #append>
      <q-icon name="search" />
    </template>
  </q-input>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import { useTranslation } from '../../composables/i18n'

  const t = useTranslation()

  defineProps<{ modelValue: string }>()

  const emit = defineEmits(['update:modelValue'])
  const filter = ref('')
  watch(filter, newValue => (emit('update:modelValue', newValue)))
</script>
