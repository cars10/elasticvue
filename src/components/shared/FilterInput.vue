<template>
  <q-input v-model="filter" :label="t('defaults.filter.label')" dense @keyup.esc="filter = ''" outlined>
    <template #append>
      <q-icon name="search" />
    </template>
  </q-input>
</template>

<script setup>
  import { ref, watch } from 'vue'
  import { useTranslation } from '../../composables/i18n'

  const t = useTranslation()

  defineProps({
    modelValue: {
      type: String,
      default: ''
    }
  })

  const emit = defineEmits(['update:modelValue'])
  const filter = ref('')
  watch(filter, newValue => (emit('update:modelValue', newValue)))
</script>
