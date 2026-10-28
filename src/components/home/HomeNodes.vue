<template>
  <q-card class="full-height" data-testid="cluster-node-load">
    <q-card-section class="row items-center justify-between">
      <div class="text-weight-medium">{{ t('home.nodes.title', { count: totalCount }) }}</div>
      <router-link :to="{ name: 'nodes', params: { clusterIndex: connectionStore.activeClusterIndex } }" class="font-13">
        {{ t('home.nodes.all') }}
      </router-link>
    </q-card-section>

    <q-card-section v-if="nodes.length" class="q-pt-none text-muted font-13">
      {{ tableHint }}
    </q-card-section>

    <q-markup-table v-if="nodes.length" flat dense wrap-cells>
      <thead>
        <tr>
          <th class="text-left">{{ t('home.nodes.name') }}</th>
          <th class="text-left">{{ t('home.metrics.cpu') }}</th>
          <th class="text-left">{{ t('home.nodes.heap') }}</th>
          <th class="text-left">{{ t('home.metrics.disk') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="node in nodes" :key="node.name">
          <td class="text-left">
            <span class="text-weight-medium">{{ node.name }}</span>
            <q-badge v-if="node.master" color="primary-dark" :label="t('home.nodes.master')" class="q-ml-sm" />
          </td>
          <td v-for="metric in nodeMetrics(node)" :key="metric.key">
            <metric-bar :value="metric.value" :thresholds="metric.thresholds" />
          </td>
        </tr>
      </tbody>
    </q-markup-table>

    <q-card-section v-else class="text-muted font-13">
      {{ nodesMonitoringAvailable === false ? t('home.monitoring_required') : t('home.nodes.unavailable') }}
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useConnectionStore } from '../../store/connection.ts'
import type { OverviewNode } from '../../types/homeDashboard.ts'
import MetricBar from '../shared/MetricBar.vue'
import { useTranslation } from '../../composables/i18n.ts'
import { CPU_THRESHOLDS, DISK_THRESHOLDS, HEAP_THRESHOLDS } from '../../helpers/pressure.ts'

const props = defineProps<{
  nodes: OverviewNode[]
  /** Cluster node inventory (card title). */
  totalCount: number
  /** Nodes available for ranking (hint “of N”); may be lower when stats are partial. */
  eligibleCount?: number
  nodesMonitoringAvailable: boolean | null
}>()

const connectionStore = useConnectionStore()
const t = useTranslation()

const tableHint = computed(() => {
  const shown = props.nodes.length
  const eligible = props.eligibleCount ?? props.totalCount
  if (shown >= eligible) return t('home.nodes.hint_all', { count: shown })
  return t('home.nodes.hint_top', { shown, total: eligible })
})

const nodeMetrics = (node: OverviewNode) => [
  { key: 'cpu', value: node.cpuPercent, thresholds: CPU_THRESHOLDS },
  { key: 'heap', value: node.heapPercent, thresholds: HEAP_THRESHOLDS },
  { key: 'disk', value: node.diskPercent, thresholds: DISK_THRESHOLDS }
]
</script>
