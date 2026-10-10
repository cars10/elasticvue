<template>
  <q-card class="full-height" data-testid="cluster-node-load">
    <q-card-section class="row items-center justify-between">
      <div>Nodes ({{ totalCount }})</div>
      <router-link :to="{ name: 'nodes', params: { clusterIndex: connectionStore.activeClusterIndex } }" class="font-13">
        All nodes
      </router-link>
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
            <span v-if="node.master" class="text-muted font-13"> · master</span>
          </td>
          <td v-for="metric in nodeMetrics(node)" :key="metric.key">
            <div class="row no-wrap items-center q-gutter-x-sm">
              <div class="col-auto font-mono" :class="pressureClass(metric.value, metric.warn, metric.danger)">
                {{ formatPercent(metric.value) }}
              </div>
              <q-linear-progress
                class="col"
                :value="barRatio(metric.value)"
                :color="barColor(metric.value, metric.warn, metric.danger)"
                size="10px"
                rounded
                instant-feedback
              />
            </div>
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
import { useConnectionStore } from '../../store/connection.ts'
import type { OverviewNode } from '../../types/homeDashboard.ts'

defineProps<{
  nodes: OverviewNode[]
  totalCount: number
  nodesMonitoringAvailable: boolean | null
}>()

const connectionStore = useConnectionStore()

const nodeMetrics = (node: OverviewNode) => [
  { key: 'cpu', value: node.cpuPercent, warn: 80, danger: 90 },
  { key: 'heap', value: node.heapPercent, warn: 75, danger: 85 },
  { key: 'disk', value: node.diskPercent, warn: 85, danger: 90 }
]

const formatPercent = (value?: number | null) => {
  if (value == null || Number.isNaN(value)) return '—'
  return `${Math.round(value)}%`
}

const barRatio = (value?: number | null) => {
  if (value == null || Number.isNaN(value)) return 0
  return Math.min(100, Math.max(0, value)) / 100
}

const pressureClass = (value?: number | null, warn = 75, danger = 85) => {
  if (value == null || Number.isNaN(value)) return undefined
  if (value >= danger) return 'health--red'
  if (value >= warn) return 'health--yellow'
  return undefined
}

const barColor = (value?: number | null, warn = 75, danger = 85) => {
  if (value == null || Number.isNaN(value)) return 'primary'
  if (value >= danger) return 'negative'
  if (value >= warn) return 'warning'
  return 'primary'
}
</script>
