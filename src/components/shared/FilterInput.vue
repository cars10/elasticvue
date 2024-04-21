<template>
  <q-input v-model="filter"
           :label="props.label || t('defaults.filter.label')"
           dense outlined name="filter"
           @keydown.esc="filter = ''">
    <template #append>
      <q-icon name="search" />
    </template>
  </q-input>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import { useTranslation } from '../../composables/i18n'

  const t = useTranslation()

  const props = defineProps<{ modelValue: string, label?: string }>()

  const emit = defineEmits(['update:modelValue'])
  const filter = ref(props.modelValue)
  watch(filter, newValue => (emit('update:modelValue', newValue)))
</script>
