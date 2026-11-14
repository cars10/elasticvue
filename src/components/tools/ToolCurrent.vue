<template>
  <div class="tool-current q-mb-md">
    <span class="text-muted">{{ t('tools.current') }}</span>
    <strong class="q-ml-sm">{{ value }}</strong>
    <span v-if="source" class="tool-current__source q-ml-sm">{{ labels.source(source) }}</span>
  </div>
</template>

<script setup lang="ts">
import { useTranslation } from '../../composables/i18n.ts'
import { useToolLabels } from '../../composables/components/tools/ToolLabels.ts'

defineProps<{ value: string | number; source?: string }>()
const t = useTranslation()
const labels = useToolLabels()
</script>
