<template>
  <div v-if="node" class="text-muted font-13">{{ t('home.metrics.highest') }}</div>
  <div v-if="node" class="ellipsis" :title="node">{{ node }}</div>
</template>

<script setup lang="ts">
import { useTranslation } from '../../composables/i18n.ts'

defineProps<{ node?: string | null }>()
const t = useTranslation()
</script>
