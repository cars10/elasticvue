<template>
  <tool-error :state="requests.settings.value" inspect="settings" />
  <q-stepper v-model="step" vertical flat animated>
    <q-step name="check" :title="t('tools.writes.steps.check')" icon="search" :done="step !== 'check'">
      <q-banner v-if="!blocked" rounded class="tool-banner tool-banner--success">{{ t('tools.writes.none') }}</q-banner>
      <ul v-else class="q-mt-none q-pl-md" data-testid="writes-findings">
        <li v-if="clusterWriteMode !== 'normal'">
          {{ t('tools.writes.cluster_blocked', { mode: labels.clusterWriteMode(clusterWriteMode) }) }}
        </li>
        <li v-if="blockedUserIndices.length">
          {{ t('tools.blocks.status', { count: blockedUserIndices.length }, blockedUserIndices.length) }}
        </li>
      </ul>
      <q-stepper-navigation v-if="blocked">
        <q-btn color="primary-dark" :label="t('tools.steps.continue')" @click="step = 'clear'" />
      </q-stepper-navigation>
    </q-step>

    <q-step name="clear" :title="t('tools.writes.steps.clear')" icon="lock_open" :done="step === 'verify'">
      <template v-if="clusterWriteMode !== 'normal'">
        <div class="text-weight-medium">{{ t('tools.cluster_write.title') }}</div>
        <p>{{ t('tools.writes.cluster_explanation') }}</p>
        <q-btn
          outline
          color="primary-dark"
          class="q-mb-lg"
          :label="t('tools.writes.clear_cluster')"
          :loading="requests.mutation.value.loading"
          @click="clearClusterBlock"
        />
      </template>
      <template v-if="blockedUserIndices.length">
        <div class="text-weight-medium q-mb-sm">{{ t('tools.blocks.title') }}</div>
        <blocks-tool />
      </template>
      <q-stepper-navigation>
        <q-btn color="primary-dark" :label="t('tools.steps.verify')" @click="verify" />
      </q-stepper-navigation>
    </q-step>

    <q-step name="verify" :title="t('tools.writes.steps.verify')" icon="task_alt">
      <q-banner v-if="!blocked" rounded class="tool-banner tool-banner--success">{{ t('tools.writes.resolved') }}</q-banner>
      <template v-else>
        <p class="q-mt-none" data-testid="writes-remaining">{{ t('tools.writes.remaining') }}</p>
        <ul class="q-pl-md">
          <li v-if="clusterWriteMode !== 'normal'">{{ labels.clusterWriteMode(clusterWriteMode) }}</li>
          <li v-for="index in blockedUserIndices" :key="index.name">{{ index.name }} ({{ index.blocks.join(', ') }})</li>
        </ul>
      </template>
      <q-stepper-navigation v-if="blocked">
        <q-btn color="primary-dark" :label="t('tools.steps.back')" @click="step = 'clear'" />
      </q-stepper-navigation>
    </q-step>
  </q-stepper>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTranslation } from '../../composables/i18n.ts'
import { useInjectedClusterTools } from '../../composables/components/tools/ClusterTools.ts'
import { useToolLabels } from '../../composables/components/tools/ToolLabels.ts'
import { askConfirm } from '../../helpers/dialogs.ts'
import ToolError from './ToolError.vue'
import BlocksTool from './BlocksTool.vue'

const t = useTranslation()
const labels = useToolLabels()
const { requests, clusterWriteMode, blockedUserIndices, loadSettings, loadIndices, setClusterWriteMode } =
  useInjectedClusterTools()

const step = ref('check')
const blocked = computed(() => clusterWriteMode.value !== 'normal' || blockedUserIndices.value.length > 0)

const clearClusterBlock = async () => {
  if (await askConfirm(t('tools.writes.confirm_clear_cluster'))) await setClusterWriteMode('normal')
}

const verify = async () => {
  step.value = 'verify'
  await Promise.all([loadSettings(), loadIndices()])
}
</script>
