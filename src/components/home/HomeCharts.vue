<template>
  <div class="col-12 col-sm-6 col-md-3">
    <percent-metric-card
      :title="t('home.metrics.cpu')"
      icon="computer"
      :value="maxCpu.value"
      :unavailable="nodesMonitoringAvailable === false && maxCpu.value == null"
      :warn-at="CPU_THRESHOLDS.warn"
      :danger-at="CPU_THRESHOLDS.danger"
      test-id="cluster-cpu"
    >
      <metric-node :node="maxCpu.node" />
    </percent-metric-card>
  </div>

  <div class="col-12 col-sm-6 col-md-3">
    <percent-metric-card
      :title="t('home.metrics.disk')"
      icon="storage"
      :value="maxDisk.value"
      :unavailable="nodesMonitoringAvailable === false && maxDisk.value == null"
      :warn-at="diskThresholds(diskWatermarks).warn"
      :danger-at="diskThresholds(diskWatermarks).danger"
      test-id="cluster-disk"
    >
      <metric-node :node="maxDisk.node" />
      <div class="text-muted font-13">
        {{ t('home.metrics.watermarks', { low: diskWatermarks.low, high: diskWatermarks.high, flood: diskWatermarks.flood }) }}
      </div>
    </percent-metric-card>
  </div>

  <div class="col-12 col-sm-6 col-md-3">
    <percent-metric-card
      :title="t('home.metrics.heap')"
      icon="memory"
      :value="maxHeap.value"
      :unavailable="nodesMonitoringAvailable === false && maxHeap.value == null"
      :warn-at="HEAP_THRESHOLDS.warn"
      :danger-at="HEAP_THRESHOLDS.danger"
      test-id="cluster-heap"
    >
      <metric-node :node="maxHeap.node" />
      <div v-if="maxHeap.detail" class="text-muted font-13">{{ maxHeap.detail }}</div>
    </percent-metric-card>
  </div>

  <div class="col-12 col-sm-6 col-md-3">
    <percent-metric-card
      :title="t('home.metrics.shards')"
      icon="view_module"
      :value="shardAllocationPercent"
      :warn-at="100"
      :danger-at="shardDangerAt"
      higher-is-better
      test-id="cluster-shards"
    >
      <div>
        {{ t('home.metrics.primaries', { count: health?.active_primary_shards ?? stats.indices?.shards?.primaries ?? 0 }) }}
      </div>
      <div>{{ t('home.metrics.total', { count: shardTotal }) }}</div>
    </percent-metric-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import PercentMetricCard from './PercentMetricCard.vue'
import MetricNode from './MetricNode.vue'
import { useTranslation } from '../../composables/i18n.ts'
import { CPU_THRESHOLDS, diskThresholds, HEAP_THRESHOLDS } from '../../helpers/pressure.ts'
import { toNumber } from '../../helpers/nodeStats.ts'
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

const t = useTranslation()

const shardUnassigned = computed(() => props.health?.unassigned_shards || 0)
const shardUnassignedPrimaries = computed(() => props.health?.unassigned_primary_shards)

const clusterStatus = computed(() => (props.health?.status || props.stats.status || '').toLowerCase())

const shardTotal = computed(() => {
  const active = props.health?.active_shards
  if (active != null) return active + shardUnassigned.value
  return props.stats.indices?.shards?.total || 0
})

const shardAllocationPercent = computed(() => {
  const percent = toNumber(props.health?.active_shards_percent_as_number)
  if (percent != null) return percent
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
