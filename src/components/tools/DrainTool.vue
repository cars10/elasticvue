<template>
  <tool-error :state="requests.nodes.value" inspect="nodes" />
  <q-banner v-if="allocationMode === 'none'" rounded class="tool-banner tool-banner--warning q-mb-md">
    {{ t('tools.drain.allocation_disabled') }}
  </q-banner>
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
    <div class="q-mt-md">
      <strong>{{ selectedNode.name }}</strong>
      <span class="text-muted q-ml-sm">{{ selectedNode.id }}</span>
      <div class="text-muted font-13">
        {{ t('tools.drain.node_summary', { shards: selectedNode.shardCount }, selectedNode.shardCount) }}
        <template v-if="selectedNode.diskUsedPercent != null">
          · {{ t('tools.drain.disk_used', { percent: selectedNode.diskUsedPercent }) }}
        </template>
      </div>
    </div>

    <template v-if="selectedNodeExcluded">
      <q-linear-progress rounded size="8px" class="q-my-md" :value="progress" color="primary" />
      <p>
        {{
          t('tools.drain.progress', {
            remaining: selectedNode.shardCount,
            total: initialCount,
            relocating: selectedNode.relocatingShards
          })
        }}
      </p>
      <q-banner v-if="selectedNode.shardCount === 0" rounded class="tool-banner tool-banner--success q-mb-md">
        {{ t('tools.drain.done') }}
      </q-banner>
      <q-btn color="negative" outline :label="t('tools.drain.stop')" @click="stop" />
    </template>
    <q-btn v-else color="primary" class="q-mt-md" :label="t('tools.drain.start')" @click="start" />
  </template>

  <p v-if="excludedNodeIds.length" class="font-13 text-muted q-mt-md">
    {{ t('tools.drain.existing', { ids: excludedNodeIds.join(', ') }) }}
  </p>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { useTranslation } from '../../composables/i18n.ts'
import { useInjectedClusterTools } from '../../composables/components/tools/ClusterTools.ts'
import { askConfirm } from '../../helpers/dialogs.ts'
import { nodeDrainProgress } from '../../helpers/clusterTools.ts'
import ToolError from './ToolError.vue'

const t = useTranslation()
const { requests, nodes, allocationMode, excludedNodeIds, loadShards, loadNodes, setNodeDrain } = useInjectedClusterTools()

const selectedNodeId = ref<string | null>(null)
const initialCounts = reactive<Record<string, number>>({})
const selectedNode = computed(() => nodes.value.find((node) => node.id === selectedNodeId.value) || null)
const selectedNodeExcluded = computed(() => Boolean(selectedNodeId.value && excludedNodeIds.value.includes(selectedNodeId.value)))
const initialCount = computed(() =>
  selectedNode.value
    ? initialCounts[selectedNode.value.id] || Math.max(selectedNode.value.initialShardCount, selectedNode.value.shardCount)
    : 0
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

const start = async () => {
  const node = selectedNode.value
  if (!node || !(await askConfirm(t('tools.drain.confirm_start', { name: node.name, id: node.id })))) return
  initialCounts[node.id] = node.shardCount
  await setNodeDrain(node.id, true)
}

const stop = async () => {
  const node = selectedNode.value
  if (!node || !(await askConfirm(t('tools.drain.confirm_stop', { name: node.name, id: node.id })))) return
  await setNodeDrain(node.id, false)
}

let timer: number | undefined
watch(
  selectedNodeExcluded,
  (active) => {
    window.clearInterval(timer)
    if (active) timer = window.setInterval(() => loadShards().then(loadNodes), 5000)
  },
  { immediate: true }
)
onBeforeUnmount(() => window.clearInterval(timer))
</script>
