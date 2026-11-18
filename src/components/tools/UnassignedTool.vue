<template>
  <tool-error :state="requests.health.value" inspect="health" />
  <q-stepper v-model="step" vertical flat animated>
    <q-step name="check" :title="t('tools.unassigned.steps.check')" icon="search" :done="step !== 'check'">
      <q-banner v-if="!unassignedCount" rounded class="tool-banner tool-banner--success">
        {{ t('tools.status.no_unassigned') }}
      </q-banner>
      <template v-else>
        <p class="q-mt-none">
          {{ t('tools.unassigned.found', { count: unassignedCount, primaries: unassignedPrimaries }, unassignedCount) }}
        </p>
        <q-banner v-if="allocationMode !== 'all'" rounded class="tool-banner tool-banner--warning q-mb-md">
          {{ t('tools.unassigned.allocation_limited', { mode: labels.allocationMode(allocationMode) }) }}
        </q-banner>
        <q-banner v-if="dataNodeCount === 1" rounded class="tool-banner tool-banner--warning q-mb-md">
          {{ t('tools.unassigned.single_node') }}
        </q-banner>
      </template>
      <q-stepper-navigation v-if="unassignedCount">
        <q-btn
          color="primary-dark"
          :label="t('tools.steps.continue')"
          @click="step = capabilities.allocationExplain ? 'explain' : 'fix'"
        />
      </q-stepper-navigation>
    </q-step>

    <q-step
      v-if="capabilities.allocationExplain"
      name="explain"
      :title="t('tools.unassigned.steps.explain')"
      icon="help_outline"
      :done="Boolean(explanation)"
    >
      <explain-tool />
      <q-stepper-navigation>
        <q-btn color="primary-dark" :label="t('tools.steps.continue')" @click="step = 'fix'" />
        <q-btn flat :label="t('tools.steps.back')" class="q-ml-sm" @click="step = 'check'" />
      </q-stepper-navigation>
    </q-step>

    <q-step name="fix" :title="t('tools.unassigned.steps.fix')" icon="build" :done="step === 'verify'">
      <p v-if="!remedies.some((remedy) => remedy.recommended)" class="q-mt-none">{{ t('tools.unassigned.no_fix') }}</p>
      <q-list bordered separator class="rounded-borders">
        <q-item v-for="remedy in remedies" :key="remedy.id" :data-testid="`remedy-${remedy.id}`">
          <q-item-section>
            <q-item-label class="text-weight-medium">
              {{ remedyLabels[remedy.id].title }}
              <q-badge v-if="remedy.recommended" color="primary-dark" class="q-ml-sm">{{
                t('tools.unassigned.recommended')
              }}</q-badge>
            </q-item-label>
            <q-item-label caption>{{ remedyLabels[remedy.id].text }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn
              outline
              color="primary-dark"
              :label="remedyLabels[remedy.id].action"
              :loading="requests.mutation.value.loading"
              @click="applyRemedy(remedy.id)"
            />
          </q-item-section>
        </q-item>
      </q-list>
      <q-stepper-navigation>
        <q-btn color="primary-dark" :label="t('tools.steps.verify')" @click="verify" />
        <q-btn
          flat
          :label="t('tools.steps.back')"
          class="q-ml-sm"
          @click="step = capabilities.allocationExplain ? 'explain' : 'check'"
        />
      </q-stepper-navigation>
    </q-step>

    <q-step name="verify" :title="t('tools.unassigned.steps.verify')" icon="task_alt">
      <q-banner v-if="!unassignedCount" rounded class="tool-banner tool-banner--success">
        {{ t('tools.unassigned.resolved', { before: unassignedBefore }) }}
      </q-banner>
      <template v-else>
        <p class="q-mt-none" data-testid="unassigned-verify">
          {{
            t('tools.unassigned.remaining', { before: unassignedBefore, now: unassignedCount, initializing: initializingCount })
          }}
        </p>
        <q-linear-progress v-if="initializingCount" indeterminate rounded color="primary" class="q-mb-md" />
      </template>
      <q-stepper-navigation v-if="unassignedCount">
        <q-btn color="primary-dark" :label="t('tools.unassigned.investigate_again')" @click="restart" />
      </q-stepper-navigation>
    </q-step>
  </q-stepper>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTranslation } from '../../composables/i18n.ts'
import { useInjectedClusterTools, usePolling } from '../../composables/components/tools/ClusterTools.ts'
import { useToolLabels } from '../../composables/components/tools/ToolLabels.ts'
import { askConfirm } from '../../helpers/dialogs.ts'
import { summarizeAllocationExplanation, unassignedRemedies, UnassignedRemedy } from '../../helpers/clusterTools.ts'
import ToolError from './ToolError.vue'
import ExplainTool from './ExplainTool.vue'

const t = useTranslation()
const labels = useToolLabels()
const tools = useInjectedClusterTools()
const {
  capabilities,
  requests,
  health,
  explanation,
  allocationMode,
  unassignedCount,
  dataNodeCount,
  singleNodeReplicaIndices,
  loadHealth,
  loadShards
} = tools

const step = ref('check')
const unassignedBefore = ref(0)
const unassignedPrimaries = computed(() => health.value?.unassigned_primary_shards ?? '?')
const initializingCount = computed(() => health.value?.initializing_shards ?? 0)

const remedies = computed(() =>
  unassignedRemedies({
    allocationMode: allocationMode.value,
    explanation: explanation.value,
    summary: explanation.value ? summarizeAllocationExplanation(explanation.value, dataNodeCount.value) : null,
    singleNodeReplicaCount: singleNodeReplicaIndices.value.length,
    canRetry: capabilities.retryFailed
  })
)

const remedyLabels = computed(() => ({
  enable_allocation: {
    title: t('tools.unassigned.remedies.enable_allocation.title'),
    text: t('tools.unassigned.remedies.enable_allocation.text'),
    action: t('tools.unassigned.remedies.enable_allocation.action')
  },
  zero_replicas: {
    title: t('tools.unassigned.remedies.zero_replicas.title'),
    text: t(
      'tools.replicas.single_node',
      { count: singleNodeReplicaIndices.value.length },
      singleNodeReplicaIndices.value.length
    ),
    action: t('tools.replicas.set_zero')
  },
  retry: {
    title: t('tools.retry.title'),
    text: t('tools.retry.explanation'),
    action: t('tools.retry.run')
  }
}))

const applyRemedy = async (id: UnassignedRemedy['id']) => {
  const before = unassignedCount.value
  let changed = false
  if (id === 'enable_allocation') {
    changed = await tools.setAllocation(capabilities.settingsReset ? null : 'all')
  } else if (id === 'zero_replicas') {
    const names = singleNodeReplicaIndices.value.map((index) => index.name)
    if (await askConfirm(t('tools.replicas.confirm_zero', { count: names.length }, names.length))) {
      changed = await tools.setReplicas(names, 0)
    }
  } else if (await askConfirm(t('tools.retry.confirm', { count: before }, before))) {
    changed = await tools.retryFailed()
  }
  if (changed) {
    unassignedBefore.value = before
    step.value = 'verify'
  }
}

const verify = () => {
  unassignedBefore.value = unassignedCount.value
  step.value = 'verify'
  loadHealth()
}

const restart = () => {
  explanation.value = null
  step.value = 'check'
  loadShards()
}

usePolling(
  () => step.value === 'verify' && unassignedCount.value > 0,
  () => Promise.all([loadHealth(), loadShards()])
)
</script>
