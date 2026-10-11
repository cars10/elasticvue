<template>
  <template v-if="stats">
    <div class="col-12">
      <cluster-overview :stats="stats" :version-label="versionLabel" />
    </div>

    <div class="col-12">
      <div class="row q-col-gutter-xl" data-testid="cluster-capacity">
        <home-charts
          :max-cpu="maxCpu"
          :max-disk="maxDisk"
          :max-heap="maxHeap"
          :disk-watermarks="diskWatermarks"
          :nodes-monitoring-available="nodesMonitoringAvailable"
          :health="health"
          :stats="stats"
        />
      </div>
    </div>

    <div class="col-12">
      <home-attention :checks="attentionChecks" />
    </div>

    <div class="col-12">
      <div class="row q-col-gutter-xl" data-testid="cluster-workload">
        <home-workload :workload="workload" :reload-interval="reloadInterval" />
      </div>
    </div>

    <div class="col-12 col-lg-6">
      <home-nodes
        :nodes="topNodes"
        :total-count="stats.nodes.count.total"
        :eligible-count="nodes.length"
        :nodes-monitoring-available="nodesMonitoringAvailable"
      />
    </div>

    <div class="col-12 col-lg-6">
      <home-indices :indices="attentionIndices" :total-count="attentionIndicesTotal" />
    </div>
  </template>
</template>

<script setup lang="ts">
import ClusterOverview from './ClusterOverview.vue'
import HomeAttention from './HomeAttention.vue'
import HomeCharts from './HomeCharts.vue'
import HomeIndices from './HomeIndices.vue'
import HomeNodes from './HomeNodes.vue'
import HomeWorkload from './HomeWorkload.vue'
import { useHomeDashboard } from '../../composables/components/home/HomeDashboard.ts'

defineProps<{
  reloadInterval?: number | null
}>()

const {
  stats,
  health,
  nodes,
  topNodes,
  attentionIndices,
  attentionIndicesTotal,
  nodesMonitoringAvailable,
  diskWatermarks,
  workload,
  versionLabel,
  maxHeap,
  maxDisk,
  maxCpu,
  attentionChecks,
  refresh
} = useHomeDashboard()

defineExpose({ refresh })
</script>
