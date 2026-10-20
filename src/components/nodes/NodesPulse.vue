<template>
  <div class="row q-col-gutter-lg" data-testid="nodes-pulse">
    <div :class="colClass">
      <pulse-metric-card title="Nodes" icon="dns" :value="summary.total" test-id="nodes-pulse-count">
        <div class="text-muted font-13 q-mt-xs">{{ roleBreakdown }}</div>
        <div v-if="summary.versions.length > 1" class="font-13 q-mt-xs health--yellow">
          Mixed versions: {{ summary.versions.join(', ') }}
        </div>
        <div v-else-if="summary.versions.length === 1" class="text-muted font-13 q-mt-xs">Version {{ summary.versions[0] }}</div>
        <div
          v-if="summary.recentlyRestarted.length"
          class="font-13 q-mt-xs health--yellow"
          :title="summary.recentlyRestarted.join(', ')"
        >
          {{ summary.recentlyRestarted.length }} restarted in the last hour
        </div>
      </pulse-metric-card>
    </div>

    <div :class="colClass">
      <pulse-metric-card
        title="CPU"
        icon="computer"
        :value="formatPercent(summary.cpu.avg)"
        :value-class="pressureTextClass(pressureLevel(summary.cpu.avg, CPU_THRESHOLDS))"
        unit="avg"
        :history="cpuHistory"
        test-id="nodes-pulse-cpu"
      >
        <nodes-pulse-peak :peak="summary.cpu.peak" :thresholds="CPU_THRESHOLDS" />
      </pulse-metric-card>
    </div>

    <div :class="colClass">
      <pulse-metric-card
        title="JVM Heap"
        icon="memory"
        :value="formatPercent(summary.heap.avg)"
        :value-class="pressureTextClass(pressureLevel(summary.heap.avg, HEAP_THRESHOLDS))"
        unit="avg"
        :history="heapHistory"
        test-id="nodes-pulse-heap"
      >
        <nodes-pulse-peak :peak="summary.heap.peak" :thresholds="HEAP_THRESHOLDS" />
      </pulse-metric-card>
    </div>

    <div :class="colClass">
      <pulse-metric-card
        title="Disk"
        icon="storage"
        :value="formatPercent(summary.disk.percent)"
        :value-class="pressureTextClass(pressureLevel(summary.disk.percent, diskThresholds(diskWatermarks)))"
        unit="used"
        test-id="nodes-pulse-disk"
      >
        <div v-if="summary.disk.totalBytes" class="text-muted font-13 q-mt-xs">
          {{ prettyPrintByteString(summary.disk.usedBytes) }} of {{ prettyPrintByteString(summary.disk.totalBytes) }}
        </div>
        <div v-if="watermarkIssues.length" class="font-13 q-mt-xs">
          <span v-for="(issue, i) in watermarkIssues" :key="issue.label" :class="issue.class">
            {{ issue.count }} {{ issue.label }}<template v-if="i < watermarkIssues.length - 1">, </template>
          </span>
        </div>
        <div v-else class="text-muted font-13 q-mt-xs">All nodes below low watermark ({{ diskWatermarks.low }})</div>
      </pulse-metric-card>
    </div>

    <div v-if="summary.shards" :class="colClass">
      <shard-balance-card :spread="summary.shards" test-id="nodes-pulse-shards" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import PulseMetricCard from '../shared/PulseMetricCard.vue'
import NodesPulsePeak from './NodesPulsePeak.vue'
import ShardBalanceCard from '../shards/ShardBalanceCard.vue'
import { prettyPrintByteString } from '../../helpers/bytes.ts'
import {
  CPU_THRESHOLDS,
  diskThresholds,
  formatPercent,
  HEAP_THRESHOLDS,
  pressureLevel,
  pressureTextClass
} from '../../helpers/pressure.ts'
import type { DiskWatermarks } from '../../types/homeDashboard.ts'
import type { NodesSummary } from '../../types/nodes.ts'

const props = defineProps<{
  summary: NodesSummary
  diskWatermarks: DiskWatermarks
  cpuHistory: number[]
  heapHistory: number[]
}>()

const colClass = computed(() => (props.summary.shards ? 'col-12 col-sm-6 col-lg' : 'col-12 col-sm-6 col-lg-3'))

const roleBreakdown = computed(() => {
  const { masterEligible, data, ingest, ml, coordinating } = props.summary.roles
  return [
    [masterEligible, 'master-eligible'],
    [data, 'data'],
    [ingest, 'ingest'],
    [ml, 'ml'],
    [coordinating, 'coordinating']
  ]
    .filter(([count]) => count)
    .map(([count, label]) => `${count} ${label}`)
    .join(', ')
})

const watermarkIssues = computed(() => {
  const { aboveFlood, aboveHigh, aboveLow } = props.summary.disk
  return [
    { count: aboveFlood, label: 'above flood stage', class: 'health--red' },
    { count: aboveHigh, label: 'above high', class: 'health--red' },
    { count: aboveLow, label: 'above low', class: 'health--yellow' }
  ].filter((issue) => issue.count > 0)
})
</script>
