<template>
  <div class="col-md-6">
    <pulse-metric-card title="Search" icon="search" test-id="cluster-search">
      <template #value>
        <span v-if="reloadDisabled" class="text-muted font-13">{{ reloadDisabledMessage }}</span>
        <template v-else-if="workload.searchPerSec != null">
          {{ workload.searchPerSec.toFixed(1) }}
          <span class="text-muted font-13 text-weight-regular">req/s</span>
        </template>
        <template v-else>
          <span class="text-muted">Collecting…</span>
        </template>
      </template>

      <template v-if="!reloadDisabled">
        <line-chart class="q-mt-sm" :values="workload.searchHistory" :height="48" />
        <div class="text-muted font-13 q-mt-xs">{{ sampleWindowLabel }}</div>
      </template>
    </pulse-metric-card>
  </div>

  <div class="col-md-3">
    <pulse-metric-card title="Indexing" icon="upload_file" test-id="cluster-indexing">
      <template #value>
        <span v-if="reloadDisabled" class="text-muted font-13">{{ reloadDisabledMessage }}</span>
        <template v-else-if="workload.indexingPerSec != null">
          {{ workload.indexingPerSec.toFixed(1) }}
          <span class="text-muted font-13 text-weight-regular">docs/s</span>
        </template>
        <template v-else>
          <span class="text-muted">Collecting…</span>
        </template>
      </template>

      <template v-if="!reloadDisabled">
        <line-chart class="q-mt-sm" :values="workload.indexingHistory" :height="48" />
        <div v-if="workload.deletePerSec != null" class="text-muted font-13 q-mt-xs">
          {{ workload.deletePerSec.toFixed(1) }} deletes/s
        </div>
      </template>
    </pulse-metric-card>
  </div>

  <div class="col-md-3">
    <pulse-metric-card title="Latency / pressure" icon="speed" test-id="cluster-latency">
      <template #value>
        <span v-if="reloadDisabled" class="text-muted font-13">{{ reloadDisabledMessage }}</span>
        <template v-else-if="workload.searchLatencyMs != null">
          {{ formatLatency(workload.searchLatencyMs) }}
          <span class="text-muted font-13 text-weight-regular">search</span>
        </template>
        <template v-else>
          <span class="text-muted">Collecting…</span>
        </template>
      </template>

      <template v-if="!reloadDisabled">
        <line-chart class="q-mt-sm" :values="workload.searchLatencyHistory" :height="48" />
        <div class="text-muted font-13 q-mt-xs">
          <span v-if="workload.indexingLatencyMs != null">{{ formatLatency(workload.indexingLatencyMs) }} indexing</span>
          <span v-else>—</span>
        </div>
        <div
          class="font-13 q-mt-xs"
          :class="{
            'health--yellow': (workload.rejectedDelta || 0) > 0 || (workload.breakerDelta || 0) > 0,
            'text-muted': !(workload.rejectedDelta || 0) && !(workload.breakerDelta || 0)
          }"
        >
          {{ workload.rejectedDelta ?? 0 }} rejected · {{ workload.breakerDelta ?? 0 }} breaker trips
        </div>
      </template>
    </pulse-metric-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import LineChart from '../shared/LineChart.vue'
import PulseMetricCard from '../shared/PulseMetricCard.vue'
import type { WorkloadRates } from '../../types/homeDashboard.ts'

const props = defineProps<{
  workload: WorkloadRates
  reloadInterval?: number | null
}>()

const reloadDisabled = computed(() => props.reloadInterval == null)
const reloadDisabledMessage = 'Auto-reload is off. Enable it to collect this graph.'

const sampleWindowLabel = computed(() => `Avg over last ${props.reloadInterval}s`)

const formatLatency = (ms: number) => {
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)} s`
  if (ms >= 10) return `${Math.round(ms)} ms`
  return `${ms.toFixed(1)} ms`
}
</script>
