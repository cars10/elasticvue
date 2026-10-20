<template>
  <q-card class="full-height" data-testid="cluster-node-load">
    <q-card-section class="row items-center justify-between">
      <div>Nodes ({{ totalCount }})</div>
      <router-link :to="{ name: 'nodes', params: { clusterIndex: connectionStore.activeClusterIndex } }" class="font-13">
        All nodes
      </router-link>
    </q-card-section>

    <q-card-section v-if="nodes.length" class="q-pt-none text-muted font-13">
      {{ tableHint }}
    </q-card-section>

    <q-markup-table v-if="nodes.length" flat dense wrap-cells>
      <thead>
        <tr>
          <th class="text-left">Name</th>
          <th class="text-left">CPU</th>
          <th class="text-left">Heap</th>
          <th class="text-left">Disk</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="node in nodes" :key="node.name">
          <td class="text-left">
            <span class="text-weight-medium">{{ node.name }}</span>
            <q-chip v-if="node.master" color="primary" dense class="q-ml-md">master</q-chip>
          </td>
          <td v-for="metric in nodeMetrics(node)" :key="metric.key">
            <metric-bar :value="metric.value" :thresholds="metric.thresholds" />
          </td>
        </tr>
      </tbody>
    </q-markup-table>

    <q-card-section v-else class="text-muted font-13">
      {{ nodesMonitoringAvailable === false ? 'Monitoring permission required' : 'Node metrics unavailable.' }}
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useConnectionStore } from '../../store/connection.ts'
import type { OverviewNode } from '../../types/homeDashboard.ts'
import MetricBar from '../shared/MetricBar.vue'
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

const tableHint = computed(() => {
  const shown = props.nodes.length
  const eligible = props.eligibleCount ?? props.totalCount
  if (shown >= eligible) {
    return `Showing all ${shown}, ordered by highest CPU, heap, or disk.`
  }
  return `Showing top ${shown} of ${eligible} by highest CPU, heap, or disk.`
})

const nodeMetrics = (node: OverviewNode) => [
  { key: 'cpu', value: node.cpuPercent, thresholds: CPU_THRESHOLDS },
  { key: 'heap', value: node.heapPercent, thresholds: HEAP_THRESHOLDS },
  { key: 'disk', value: node.diskPercent, thresholds: DISK_THRESHOLDS }
]
</script>
