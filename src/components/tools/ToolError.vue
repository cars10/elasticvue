<template>
  <q-banner v-if="message" rounded class="tool-banner tool-banner--warning q-mb-md" role="alert">{{ message }}</q-banner>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTranslation } from '../../composables/i18n.ts'
import { useToolLabels } from '../../composables/components/tools/ToolLabels.ts'
import type { RequestState } from '../../composables/CallElasticsearch.ts'

const props = defineProps<{ state: RequestState; inspect: string }>()
const t = useTranslation()
const labels = useToolLabels()

const message = computed(() => {
  const { state } = props
  if (!state.apiError && !state.networkError) return ''
  const what = labels.inspect(props.inspect)
  if (state.status === 401 || state.status === 403) return t('tools.errors.forbidden', { what })
  if (state.networkError) return t('tools.errors.network', { what })
  return t('tools.errors.api', { what, message: state.apiErrorMessage })
})
</script>
