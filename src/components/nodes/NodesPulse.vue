<template>
  <div class="row q-col-gutter-md" data-testid="nodes-pulse">
    <div :class="colClass">
      <pulse-metric-card :title="t('cluster_nodes.pulse.nodes')" icon="dns" :value="summary.total" test-id="nodes-pulse-count">
        <div class="text-muted font-13 q-mt-xs">{{ roleBreakdown }}</div>
        <div v-if="summary.versions.length > 1" class="font-13 q-mt-xs health--yellow">
          {{ t('cluster_nodes.pulse.mixed_versions', { versions: summary.versions.join(', ') }) }}
        </div>
        <div v-else-if="summary.versions.length === 1" class="text-muted font-13 q-mt-xs">
          {{ t('cluster_nodes.pulse.version', { version: summary.versions[0] }) }}
        </div>
        <div
          v-if="summary.recentlyRestarted.length"
          class="font-13 q-mt-xs health--yellow"
          :title="summary.recentlyRestarted.join(', ')"
        >
          {{ t('cluster_nodes.pulse.restarted', { count: summary.recentlyRestarted.length }, summary.recentlyRestarted.length) }}
        </div>
      </pulse-metric-card>
    </div>

    <div :class="colClass">
      <pulse-metric-card
        :title="t('home.metrics.cpu')"
        icon="computer"
        :value="formatPercent(summary.cpu.avg)"
        :value-class="pressureTextClass(pressureLevel(summary.cpu.avg, CPU_THRESHOLDS))"
        :unit="t('cluster_nodes.pulse.avg')"
        :history="cpuHistory"
        test-id="nodes-pulse-cpu"
      >
        <nodes-pulse-peak :peak="summary.cpu.peak" :thresholds="CPU_THRESHOLDS" />
      </pulse-metric-card>
    </div>

    <div :class="colClass">
      <pulse-metric-card
        :title="t('home.metrics.heap')"
        icon="memory"
        :value="formatPercent(summary.heap.avg)"
        :value-class="pressureTextClass(pressureLevel(summary.heap.avg, HEAP_THRESHOLDS))"
        :unit="t('cluster_nodes.pulse.avg')"
        :history="heapHistory"
        test-id="nodes-pulse-heap"
      >
        <nodes-pulse-peak :peak="summary.heap.peak" :thresholds="HEAP_THRESHOLDS" />
      </pulse-metric-card>
    </div>

    <div :class="colClass">
      <pulse-metric-card
        :title="t('home.metrics.disk')"
        icon="storage"
        :value="formatPercent(summary.disk.percent)"
        :value-class="pressureTextClass(pressureLevel(summary.disk.percent, diskThresholds(diskWatermarks)))"
        :unit="t('cluster_nodes.pulse.used')"
        test-id="nodes-pulse-disk"
      >
        <div v-if="summary.disk.totalBytes" class="text-muted font-13 q-mt-xs">
          {{
            t('cluster_nodes.pulse.disk_of', {
              used: prettyPrintByteString(summary.disk.usedBytes),
              total: prettyPrintByteString(summary.disk.totalBytes)
            })
          }}
        </div>
        <div v-if="watermarkIssues.length" class="font-13 q-mt-xs">
          <span v-for="(issue, i) in watermarkIssues" :key="issue.label" :class="issue.class">
            {{ issue.label }}<template v-if="i < watermarkIssues.length - 1">, </template>
          </span>
        </div>
        <div v-else class="text-muted font-13 q-mt-xs">
          {{ t('cluster_nodes.pulse.below_low', { low: diskWatermarks.low }) }}
        </div>
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
import { useTranslation } from '../../composables/i18n.ts'
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

const t = useTranslation()

const colClass = computed(() => (props.summary.shards ? 'col-12 col-sm-6 col-lg' : 'col-12 col-sm-6 col-lg-3'))

const roleBreakdown = computed(() => {
  const { masterEligible, data, ingest, ml, coordinating } = props.summary.roles
  return [
    masterEligible && t('cluster_nodes.pulse.roles.master_eligible', { count: masterEligible }),
    data && t('cluster_nodes.pulse.roles.data', { count: data }),
    ingest && t('cluster_nodes.pulse.roles.ingest', { count: ingest }),
    ml && t('cluster_nodes.pulse.roles.ml', { count: ml }),
    coordinating && t('cluster_nodes.pulse.roles.coordinating', { count: coordinating })
  ]
    .filter(Boolean)
    .join(', ')
})

const watermarkIssues = computed(() => {
  const { aboveFlood, aboveHigh, aboveLow } = props.summary.disk
  return [
    { count: aboveFlood, label: t('cluster_nodes.pulse.above_flood', { count: aboveFlood }, aboveFlood), class: 'health--red' },
    { count: aboveHigh, label: t('cluster_nodes.pulse.above_high', { count: aboveHigh }, aboveHigh), class: 'health--red' },
    { count: aboveLow, label: t('cluster_nodes.pulse.above_low', { count: aboveLow }, aboveLow), class: 'health--yellow' }
  ].filter((issue) => issue.count > 0)
})
</script>
