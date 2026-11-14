<template>
  <div class="col-12 col-sm-6 col-md-3">
    <pulse-metric-card :title="t('home.workload.search')" icon="search" test-id="cluster-search">
      <template #value>
        <span v-if="reloadDisabled" class="text-muted font-13 text-weight-regular">{{ reloadDisabledMessage }}</span>
        <template v-else-if="workload.searchPerSec != null">
          {{ workload.searchPerSec.toFixed(1) }}
          <span class="text-muted font-13 text-weight-regular">{{ t('home.workload.per_second') }}</span>
        </template>
        <template v-else>
          <span class="text-muted font-13 text-weight-regular">{{ t('home.workload.collecting') }}</span>
        </template>
      </template>

      <template v-if="!reloadDisabled">
        <line-chart class="q-mt-sm" :values="workload.searchHistory" :height="48" />
        <div class="text-muted font-13 q-mt-xs">{{ sampleWindowLabel }}</div>
      </template>
    </pulse-metric-card>
  </div>

  <div class="col-12 col-sm-6 col-md-3">
    <pulse-metric-card :title="t('home.workload.indexing')" icon="upload_file" test-id="cluster-indexing">
      <template #value>
        <span v-if="reloadDisabled" class="text-muted font-13 text-weight-regular">{{ reloadDisabledMessage }}</span>
        <template v-else-if="workload.indexingPerSec != null">
          {{ workload.indexingPerSec.toFixed(1) }}
          <span class="text-muted font-13 text-weight-regular">{{ t('home.workload.docs_per_second') }}</span>
        </template>
        <template v-else>
          <span class="text-muted font-13 text-weight-regular">{{ t('home.workload.collecting') }}</span>
        </template>
      </template>

      <template v-if="!reloadDisabled">
        <line-chart class="q-mt-sm" :values="workload.indexingHistory" :height="48" />
        <div v-if="workload.deletePerSec != null" class="text-muted font-13 q-mt-xs">
          {{ t('home.workload.deletes', { rate: workload.deletePerSec.toFixed(1) }) }}
        </div>
      </template>
    </pulse-metric-card>
  </div>

  <div class="col-12 col-sm-6 col-md-3">
    <pulse-metric-card :title="t('home.workload.latency')" icon="speed" test-id="cluster-latency">
      <template #value>
        <span v-if="reloadDisabled" class="text-muted font-13 text-weight-regular">{{ reloadDisabledMessage }}</span>
        <template v-else-if="workload.searchLatencyMs != null">
          {{ formatLatency(workload.searchLatencyMs) }}
          <span class="text-muted font-13 text-weight-regular">{{ t('home.workload.search_latency') }}</span>
        </template>
        <template v-else>
          <span class="text-muted font-13 text-weight-regular">{{ t('home.workload.collecting') }}</span>
        </template>
      </template>

      <template v-if="!reloadDisabled">
        <line-chart class="q-mt-sm" :values="workload.searchLatencyHistory" :height="48" />
        <div class="text-muted font-13 q-mt-xs">
          <span v-if="workload.indexingLatencyMs != null">{{
            t('home.workload.indexing_latency', { latency: formatLatency(workload.indexingLatencyMs) })
          }}</span>
          <span v-else>-</span>
        </div>
        <div
          class="font-13 q-mt-xs"
          :class="{
            'health--yellow': (workload.rejectedDelta || 0) > 0 || (workload.breakerDelta || 0) > 0,
            'text-muted': !(workload.rejectedDelta || 0) && !(workload.breakerDelta || 0)
          }"
        >
          {{ t('home.workload.pressure', { rejected: workload.rejectedDelta ?? 0, trips: workload.breakerDelta ?? 0 }) }}
        </div>
      </template>
    </pulse-metric-card>
  </div>

  <div class="col-12 col-sm-6 col-md-3">
    <pulse-metric-card :title="t('home.workload.tasks')" icon="pending_actions" test-id="cluster-tasks">
      <template #value>
        <span v-if="!tasksAvailable" class="text-muted font-13 text-weight-regular">{{
          t('home.workload.tasks_unavailable')
        }}</span>
        <template v-else-if="tasksSummary">
          {{ tasksSummary.running }}
          <span class="text-muted font-13 text-weight-regular">{{ t('home.workload.tasks_running') }}</span>
        </template>
        <span v-else class="text-muted font-13 text-weight-regular">-</span>
      </template>

      <template v-if="tasksAvailable">
        <line-chart v-if="tasksHistory.length > 1" class="q-mt-sm" :values="tasksHistory" :height="48" />
        <div v-if="tasksSummary?.longRunning" class="font-13 q-mt-xs health--yellow">
          {{ t('tasks.pulse.long_running', tasksSummary.longRunning) }}
        </div>
        <div v-else-if="tasksSummary?.longest?.runningMs != null" class="text-muted font-13 q-mt-xs">
          {{ t('home.workload.tasks_longest', { time: formatTime(tasksSummary.longest.runningMs) }) }}
        </div>
        <router-link :to="{ name: 'tasks', params: { clusterId } }" class="font-13">{{
          t('home.workload.tasks_link')
        }}</router-link>
      </template>
    </pulse-metric-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import LineChart from '../shared/LineChart.vue'
import { useTranslation } from '../../composables/i18n.ts'
import PulseMetricCard from '../shared/PulseMetricCard.vue'
import { useClusterSession } from '../../store/clusterSession.ts'
import { useConnectionStore } from '../../store/connection.ts'
import { formatTime } from '../../helpers/time.ts'
import type { WorkloadRates } from '../../types/homeDashboard.ts'
import type { TasksSummary } from '../../types/tasks.ts'

const props = defineProps<{
  workload: WorkloadRates
  reloadInterval?: number | null
  tasksSummary: TasksSummary | null
  tasksHistory: number[]
}>()

const session = useClusterSession()
const tasksAvailable = computed(() => session.capabilities.tasks)
const clusterId = useConnectionStore().activeClusterId

const reloadDisabled = computed(() => props.reloadInterval == null)
const t = useTranslation()
const reloadDisabledMessage = computed(() => t('home.workload.reload_off'))

const sampleWindowLabel = computed(() => t('home.workload.average', { seconds: props.reloadInterval }))

const formatLatency = (ms: number) => {
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)} s`
  if (ms >= 10) return `${Math.round(ms)} ms`
  return `${ms.toFixed(1)} ms`
}
</script>
