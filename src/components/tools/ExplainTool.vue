<template>
  <tool-error :state="requests.shards.value" inspect="shards" />
  <q-banner v-if="!unassignedShards.length" rounded class="tool-banner tool-banner--success">
    {{ t('tools.status.no_unassigned') }}
  </q-banner>
  <template v-else>
    <q-select v-model="selectedKey" outlined emit-value map-options :label="t('tools.explain.shard')" :options="shardOptions" />
    <q-btn
      color="primary"
      class="q-mt-md"
      :label="t('tools.explain.run')"
      :loading="requests.explain.value.loading"
      :disable="!selectedShard"
      @click="run"
    />
    <div class="q-mt-md">
      <tool-error :state="requests.explain.value" inspect="explanation" />
    </div>

    <div v-if="summary" class="q-mt-md">
      <div class="text-subtitle1 text-weight-medium">{{ labels.allocationTitle(summary.primary) }}</div>
      <div class="text-muted font-13">{{ explanation?.index }} [{{ explanation?.shard }}]</div>
      <p class="q-mt-sm">{{ reason }}</p>
      <q-list v-if="summary.decisions.length" bordered separator class="rounded-borders">
        <q-item v-for="(decision, index) in summary.decisions" :key="`${decision.decider}-${index}`">
          <q-item-section>
            <q-item-label>
              {{ decision.decider }}<span v-if="decision.nodeName" class="text-muted"> · {{ decision.nodeName }}</span>
            </q-item-label>
            <q-item-label caption>{{ decision.explanation || t('tools.explain.no_explanation') }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
      <q-expansion-item :label="t('tools.explain.raw')" dense class="q-mt-sm">
        <pre class="tool-json">{{ JSON.stringify(explanation, null, 2) }}</pre>
      </q-expansion-item>
    </div>
  </template>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useTranslation } from '../../composables/i18n.ts'
import { useInjectedClusterTools } from '../../composables/components/tools/ClusterTools.ts'
import { useToolLabels } from '../../composables/components/tools/ToolLabels.ts'
import { summarizeAllocationExplanation } from '../../helpers/clusterTools.ts'
import type { ToolShard } from '../../types/clusterTools.ts'
import ToolError from './ToolError.vue'

const t = useTranslation()
const labels = useToolLabels()
const { requests, unassignedShards, explanation, dataNodeCount, explainShard } = useInjectedClusterTools()

const shardKey = (shard: ToolShard) => `${shard.index}:${shard.shard}:${shard.prirep}`
const selectedKey = ref<string | null>(null)
const selectedShard = computed(() => unassignedShards.value.find((shard) => shardKey(shard) === selectedKey.value) || null)
const shardOptions = computed(() =>
  unassignedShards.value.map((shard) => ({
    label: `${shard.index} [${shard.shard}] ${shard.prirep === 'p' ? t('tools.explain.primary') : t('tools.explain.replica')}`,
    value: shardKey(shard)
  }))
)
watch(
  unassignedShards,
  (shards) => {
    if (!selectedShard.value && shards.length) selectedKey.value = shardKey(shards[0])
  },
  { immediate: true }
)

const summary = computed(() =>
  explanation.value ? summarizeAllocationExplanation(explanation.value, dataNodeCount.value) : null
)
const reason = computed(() => {
  if (!summary.value) return ''
  if (summary.value.singleNodeReplica) return t('tools.explain.single_node_replica')
  return summary.value.reason || t('tools.explain.no_eligible_node')
})

const run = () => selectedShard.value && explainShard(selectedShard.value)
</script>
