<template>
  <tool-error :state="requests.nodes.value" inspect="nodes" />
  <q-stepper v-model="step" vertical flat animated>
    <q-step name="node" :title="t('tools.drain.steps.node')" icon="dns" :done="Boolean(selectedNode)">
      <p class="q-mt-none">{{ t('tools.drain.explanation') }}</p>
      <q-select
        v-model="selectedNodeId"
        outlined
        emit-value
        map-options
        :label="t('tools.drain.node')"
        :options="nodeOptions"
        :disable="requests.nodes.value.loading"
      />

      <template v-if="selectedNode">
        <div class="text-muted font-13 q-mt-sm">
          {{ t('tools.drain.node_summary', { shards: selectedNode.shardCount }, selectedNode.shardCount) }}
          <template v-if="selectedNode.diskUsedPercent != null">
            , {{ t('tools.drain.disk_used', { percent: selectedNode.diskUsedPercent }) }}
          </template>
        </div>
        <q-banner v-if="!capacity?.targetCount" rounded class="tool-banner tool-banner--danger q-mt-md">
          {{ t('tools.drain.no_targets') }}
        </q-banner>
        <q-banner v-else-if="capacity?.enough === false" rounded class="tool-banner tool-banner--warning q-mt-md">
          {{
            t('tools.drain.not_enough_disk', {
              required: prettyPrintByteString(capacity.requiredBytes),
              free: prettyPrintByteString(capacity.freeBytes || 0)
            })
          }}
        </q-banner>
        <q-banner v-if="health?.status === 'red'" rounded class="tool-banner tool-banner--warning q-mt-md">
          {{ t('tools.drain.health_red') }}
        </q-banner>
        <q-banner v-if="allocationMode === 'none'" rounded class="tool-banner tool-banner--warning q-mt-md">
          {{ t('tools.drain.allocation_disabled') }}
        </q-banner>
      </template>

      <q-stepper-navigation>
        <q-btn
          color="primary-dark"
          :label="t('tools.steps.continue')"
          :disable="!selectedNode || !capacity?.targetCount"
          @click="step = stepForNode"
        />
      </q-stepper-navigation>
    </q-step>

    <q-step name="exclude" :title="t('tools.drain.steps.exclude')" icon="block" :done="selectedNodeExcluded">
      <p class="q-mt-none">{{ t('tools.drain.exclude_explanation') }}</p>
      <p v-if="excludedNodeIds.length" class="font-13 text-muted">
        {{ t('tools.drain.existing', { ids: excludedNodeIds.join(', ') }) }}
      </p>
      <q-stepper-navigation>
        <q-btn color="primary-dark" :label="t('tools.drain.start')" :loading="requests.mutation.value.loading" @click="start" />
        <q-btn flat :label="t('tools.steps.back')" class="q-ml-sm" @click="step = 'node'" />
      </q-stepper-navigation>
    </q-step>

    <q-step name="monitor" :title="t('tools.drain.steps.monitor')" icon="sync" :done="drained">
      <template v-if="selectedNode">
        <q-linear-progress rounded size="8px" class="q-mb-md" :value="progress" color="primary" />
        <p>
          {{
            t('tools.drain.progress', { remaining: selectedNode.shardCount, total: initialCount, relocating: relocatingCount })
          }}
        </p>
      </template>
      <q-stepper-navigation>
        <q-btn outline color="negative" :label="t('tools.drain.stop')" @click="stop" />
      </q-stepper-navigation>
    </q-step>

    <q-step name="done" :title="t('tools.drain.steps.done')" icon="check">
      <q-banner rounded class="tool-banner tool-banner--success q-mb-md">{{ t('tools.drain.done') }}</q-banner>
      <template v-if="masterEligible">
        <p>{{ t('tools.drain.voting_explanation') }}</p>
        <q-banner v-if="inVotingExclusions" rounded class="tool-banner tool-banner--success q-mb-md">
          {{ t('tools.drain.voting_done') }}
        </q-banner>
        <q-btn
          v-else
          outline
          color="primary-dark"
          class="q-mb-md"
          :label="t('tools.drain.voting_add')"
          :loading="requests.mutation.value.loading"
          @click="excludeFromVoting"
        />
      </template>
      <p>{{ t('tools.drain.done_next') }}</p>
      <q-stepper-navigation>
        <q-btn outline color="primary-dark" :label="t('tools.drain.cleanup')" @click="stop" />
      </q-stepper-navigation>
    </q-step>
  </q-stepper>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useTranslation } from '../../composables/i18n.ts'
import { useInjectedClusterTools, usePolling } from '../../composables/components/tools/ClusterTools.ts'
import { askConfirm } from '../../helpers/dialogs.ts'
import { drainCapacity, nodeDrainProgress } from '../../helpers/clusterTools.ts'
import { prettyPrintByteString } from '../../helpers/bytes.ts'
import ToolError from './ToolError.vue'

const t = useTranslation()
const {
  capabilities,
  requests,
  nodes,
  shards,
  health,
  allocationMode,
  excludedNodeIds,
  relocatingCount,
  loadAllocations,
  loadHealth,
  votingExclusions,
  setNodeDrain,
  addVotingExclusions,
  clearVotingExclusions
} = useInjectedClusterTools()

const step = ref('node')
const selectedNodeId = ref<string | null>(null)
const initialCounts = reactive<Record<string, number>>({})
const selectedNode = computed(() => nodes.value.find((node) => node.id === selectedNodeId.value) || null)
const selectedNodeExcluded = computed(() => Boolean(selectedNodeId.value && excludedNodeIds.value.includes(selectedNodeId.value)))
const drained = computed(() => selectedNodeExcluded.value && selectedNode.value?.shardCount === 0)
const capacity = computed(() => (selectedNode.value ? drainCapacity(selectedNode.value, nodes.value, shards.value) : null))
const initialCount = computed(() =>
  selectedNode.value ? initialCounts[selectedNode.value.id] || selectedNode.value.shardCount : 0
)
const progress = computed(() => (selectedNode.value ? nodeDrainProgress(initialCount.value, selectedNode.value.shardCount) : 0))
const nodeOptions = computed(() =>
  nodes.value
    .filter((node) => node.shardCount > 0 || excludedNodeIds.value.includes(node.id))
    .map((node) => ({
      label: `${node.name} (${t('tools.drain.shards', { count: node.shardCount }, node.shardCount)})`,
      value: node.id
    }))
)

const masterEligible = computed(
  () =>
    capabilities.votingExclusions &&
    Boolean(selectedNode.value?.roles.some((role) => role === 'master' || role === 'cluster_manager'))
)
const inVotingExclusions = computed(() => votingExclusions.value.some((exclusion) => exclusion.node_id === selectedNodeId.value))

const stepForNode = computed(() => {
  if (drained.value) return 'done'
  return selectedNodeExcluded.value ? 'monitor' : 'exclude'
})

watch(selectedNodeId, () => (step.value = selectedNodeExcluded.value ? stepForNode.value : 'node'))
watch(drained, (done) => done && step.value === 'monitor' && (step.value = 'done'))

const start = async () => {
  const node = selectedNode.value
  if (!node || !(await askConfirm(t('tools.drain.confirm_start', { name: node.name, id: node.id })))) return
  initialCounts[node.id] = node.shardCount
  if (await setNodeDrain(node.id, true)) step.value = stepForNode.value
}

const stop = async () => {
  const node = selectedNode.value
  if (!node || !(await askConfirm(t('tools.drain.confirm_stop', { name: node.name, id: node.id })))) return
  if (!(await setNodeDrain(node.id, false))) return
  if (inVotingExclusions.value) await clearVotingExclusions()
  step.value = 'node'
}

const excludeFromVoting = async () => {
  const node = selectedNode.value
  if (!node || !(await askConfirm(t('tools.drain.confirm_voting', { name: node.name })))) return
  await addVotingExclusions([node.id])
}

usePolling(
  () => selectedNodeExcluded.value && !drained.value,
  () => Promise.all([loadAllocations(), loadHealth()])
)
</script>
