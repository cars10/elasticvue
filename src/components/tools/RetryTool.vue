<template>
  <p class="q-mt-none">{{ t('tools.retry.explanation') }}</p>
  <tool-current v-if="health" :value="labels.health(health.status)" />
  <q-btn color="primary" :label="t('tools.retry.run')" :loading="requests.mutation.value.loading" @click="retry" />
</template>

<script setup lang="ts">
import { useTranslation } from '../../composables/i18n.ts'
import { useInjectedClusterTools } from '../../composables/components/tools/ClusterTools.ts'
import { useToolLabels } from '../../composables/components/tools/ToolLabels.ts'
import { askConfirm } from '../../helpers/dialogs.ts'
import ToolCurrent from './ToolCurrent.vue'

const t = useTranslation()
const labels = useToolLabels()
const { requests, health, unassignedShards, retryFailed } = useInjectedClusterTools()

const retry = async () => {
  const count = unassignedShards.value.length
  if (await askConfirm(t('tools.retry.confirm', { count }, count))) await retryFailed()
}
</script>
