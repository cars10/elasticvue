<template>
  <div class="col-md-3">
    <percent-metric-card
      title="CPU"
      icon="computer"
      :value="maxCpu.value"
      :unavailable="nodesMonitoringAvailable === false && maxCpu.value == null"
      :warn-at="CPU_THRESHOLDS.warn"
      :danger-at="CPU_THRESHOLDS.danger"
      test-id="cluster-cpu"
    >
      <div>max node:</div>
      <div>{{ maxCpu.node }}</div>
    </percent-metric-card>
  </div>

  <div class="col-md-3">
    <percent-metric-card
      title="Disk"
      icon="storage"
      :value="maxDisk.value"
      :unavailable="nodesMonitoringAvailable === false && maxDisk.value == null"
      :warn-at="diskThresholds(diskWatermarks).warn"
      :danger-at="diskThresholds(diskWatermarks).danger"
      test-id="cluster-disk"
    >
      <div>max node:</div>
      <div>{{ maxDisk.node }}</div>
      <div class="text-muted font-13">
        watermarks {{ diskWatermarks.low }} / {{ diskWatermarks.high }} /
        {{ diskWatermarks.flood }}
      </div>
    </percent-metric-card>
  </div>

  <div class="col-md-3">
    <percent-metric-card
      title="JVM Heap"
      icon="memory"
      :value="maxHeap.value"
      :unavailable="nodesMonitoringAvailable === false && maxHeap.value == null"
      :warn-at="HEAP_THRESHOLDS.warn"
      :danger-at="HEAP_THRESHOLDS.danger"
      test-id="cluster-heap"
    >
      <div>max node:</div>
      <div>{{ maxHeap.node }}</div>
      <div v-if="maxHeap.detail" class="text-muted font-13">{{ maxHeap.detail }}</div>
    </percent-metric-card>
  </div>

  <div class="col-md-3">
    <percent-metric-card
      title="Shards"
      icon="view_module"
      :value="shardAllocationPercent"
      :warn-at="100"
      :danger-at="shardDangerAt"
      higher-is-better
      test-id="cluster-shards"
    >
      <div>{{ health?.active_primary_shards ?? stats.indices?.shards?.primaries ?? 0 }} primary</div>
      <div>{{ shardTotal }} total</div>
    </percent-metric-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import PercentMetricCard from './PercentMetricCard.vue'
import { CPU_THRESHOLDS, diskThresholds, HEAP_THRESHOLDS } from '../../helpers/pressure.ts'
import type { ClusterHealth, ClusterStats, DiskWatermarks, MetricPeak } from '../../types/homeDashboard.ts'

const props = defineProps<{
  maxCpu: MetricPeak
  maxDisk: MetricPeak
  maxHeap: MetricPeak
  diskWatermarks: DiskWatermarks
  nodesMonitoringAvailable: boolean | null
  health: ClusterHealth | null
  stats: ClusterStats
}>()

const shardUnassigned = computed(() => props.health?.unassigned_shards || 0)
const shardUnassignedPrimaries = computed(() => props.health?.unassigned_primary_shards)

const clusterStatus = computed(() => (props.health?.status || props.stats.status || '').toLowerCase())

const shardTotal = computed(() => {
  const active = props.health?.active_shards
  if (active != null) return active + shardUnassigned.value
  return props.stats.indices?.shards?.total || 0
})

const shardAllocationPercent = computed(() => {
  if (props.health?.active_shards_percent_as_number != null) {
    return props.health.active_shards_percent_as_number
  }
  const total = shardTotal.value
  const active = props.health?.active_shards
  if (active == null || total <= 0) return null
  return (active / total) * 100
})

const shardDangerAt = computed(() => {
  const unassignedPrimaries = shardUnassignedPrimaries.value
  if (clusterStatus.value === 'red' || (unassignedPrimaries != null && unassignedPrimaries > 0)) return 101
  return 0
})
</script>
