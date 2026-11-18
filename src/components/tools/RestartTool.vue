<template>
  <tool-error :state="requests.health.value" inspect="health" />
  <tool-error :state="requests.settings.value" inspect="settings" />
  <q-stepper v-model="step" vertical flat animated>
    <q-step name="check" :title="t('tools.restart.steps.check')" icon="monitor_heart" :done="step !== 'check'">
      <p class="q-mt-none">{{ t('tools.restart.explanation') }}</p>
      <tool-current v-if="health" :value="labels.health(health.status)" />
      <q-banner v-if="health && health.status !== 'green'" rounded class="tool-banner tool-banner--warning q-mb-md">
        {{ t('tools.restart.not_green') }}
      </q-banner>
      <q-stepper-navigation>
        <q-btn color="primary-dark" :label="t('tools.steps.continue')" :disable="!health" @click="begin" />
      </q-stepper-navigation>
    </q-step>

    <q-step name="disable" :title="t('tools.restart.steps.disable')" icon="pause_circle" :done="replicasPaused">
      <p class="q-mt-none">{{ t('tools.restart.disable_explanation') }}</p>
      <q-stepper-navigation>
        <q-btn
          color="primary-dark"
          :label="t('tools.restart.disable')"
          :loading="requests.mutation.value.loading"
          @click="pauseReplicas"
        />
        <q-btn flat :label="t('tools.steps.back')" class="q-ml-sm" @click="step = 'check'" />
      </q-stepper-navigation>
    </q-step>

    <q-step
      name="flush"
      :title="t('tools.restart.steps.flush')"
      icon="save"
      :done="['restart', 'enable', 'verify'].includes(step)"
    >
      <p class="q-mt-none">{{ t('tools.restart.flush_explanation') }}</p>
      <q-stepper-navigation>
        <q-btn color="primary-dark" :label="t('tools.restart.flush')" :loading="requests.mutation.value.loading" @click="flush" />
        <q-btn flat :label="t('tools.steps.skip')" class="q-ml-sm" @click="step = 'restart'" />
      </q-stepper-navigation>
    </q-step>

    <q-step
      name="restart"
      :title="t('tools.restart.steps.restart')"
      icon="restart_alt"
      :done="['enable', 'verify'].includes(step)"
    >
      <p class="q-mt-none">{{ t('tools.restart.restart_explanation') }}</p>
      <p data-testid="restart-nodes">{{ t('tools.restart.nodes', { now: nodeCount, expected: expectedNodes }) }}</p>
      <q-banner v-if="nodeCount < expectedNodes" rounded class="tool-banner tool-banner--warning q-mb-md">
        {{ t('tools.restart.waiting_for_node') }}
      </q-banner>
      <q-stepper-navigation>
        <q-btn
          color="primary-dark"
          :label="t('tools.restart.node_back')"
          :disable="nodeCount < expectedNodes"
          @click="step = 'enable'"
        />
      </q-stepper-navigation>
    </q-step>

    <q-step name="enable" :title="t('tools.restart.steps.enable')" icon="play_circle" :done="step === 'verify'">
      <p class="q-mt-none">{{ t('tools.restart.enable_explanation') }}</p>
      <q-stepper-navigation>
        <q-btn
          color="primary-dark"
          :label="t('tools.restart.enable')"
          :loading="requests.mutation.value.loading"
          @click="resume"
        />
      </q-stepper-navigation>
    </q-step>

    <q-step name="verify" :title="t('tools.restart.steps.verify')" icon="task_alt">
      <q-banner v-if="health?.status === 'green'" rounded class="tool-banner tool-banner--success q-mb-md">
        {{ t('tools.restart.done') }}
      </q-banner>
      <template v-else-if="health">
        <p class="q-mt-none" data-testid="restart-recovery">
          {{
            t('tools.restart.recovering', {
              status: labels.health(health.status),
              initializing: health.initializing_shards ?? 0,
              unassigned: health.unassigned_shards ?? 0
            })
          }}
        </p>
        <q-linear-progress indeterminate rounded color="primary" class="q-mb-md" />
      </template>
      <q-stepper-navigation>
        <q-btn color="primary-dark" :label="t('tools.restart.next_node')" :disable="health?.status !== 'green'" @click="begin" />
      </q-stepper-navigation>
    </q-step>
  </q-stepper>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useTranslation } from '../../composables/i18n.ts'
import { useInjectedClusterTools, usePolling } from '../../composables/components/tools/ClusterTools.ts'
import { useToolLabels } from '../../composables/components/tools/ToolLabels.ts'
import { askConfirm } from '../../helpers/dialogs.ts'
import ToolError from './ToolError.vue'
import ToolCurrent from './ToolCurrent.vue'

const t = useTranslation()
const labels = useToolLabels()
const { capabilities, requests, health, settings, allocationMode, loadHealth, setAllocation, flushAll } =
  useInjectedClusterTools()

const step = ref('check')
const expectedNodes = ref(0)
const nodeCount = computed(() => health.value?.number_of_nodes ?? 0)
const replicasPaused = computed(() => allocationMode.value === 'primaries')

let resumed = false
watch(
  settings,
  (loaded) => {
    if (!loaded || resumed) return
    resumed = true
    if (replicasPaused.value && step.value === 'check') step.value = 'restart'
  },
  { immediate: true }
)
watch(
  nodeCount,
  (count) => {
    if (step.value !== 'restart' || count > expectedNodes.value) expectedNodes.value = count
  },
  { immediate: true }
)

const begin = () => {
  expectedNodes.value = nodeCount.value
  step.value = replicasPaused.value ? 'flush' : 'disable'
}

const pauseReplicas = async () => {
  if (!(await askConfirm(t('tools.restart.confirm_disable')))) return
  if (await setAllocation('primaries')) step.value = 'flush'
}

const flush = async () => {
  if (await flushAll()) step.value = 'restart'
}

const resume = async () => {
  if (await setAllocation(capabilities.settingsReset ? null : 'all')) step.value = 'verify'
}

usePolling(() => step.value === 'restart' || (step.value === 'verify' && health.value?.status !== 'green'), loadHealth)
</script>
