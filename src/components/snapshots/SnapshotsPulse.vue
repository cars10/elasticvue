<template>
  <div class="row q-col-gutter-lg" data-testid="snapshots-pulse">
    <div class="col-12 col-sm-6 col-lg-3">
      <pulse-metric-card title="Snapshots" icon="backup" :value="summary.total" test-id="snapshots-pulse-total">
        <div class="text-muted font-13 q-mt-xs">{{ stateBreakdown || '-' }}</div>
      </pulse-metric-card>
    </div>

    <div class="col-12 col-sm-6 col-lg-3">
      <pulse-metric-card
        title="Latest"
        icon="history"
        :value="summary.latest?.startTime ? formatTimeAgo(summary.latest.startTime) : null"
        :value-class="latestClass"
        test-id="snapshots-pulse-latest"
      >
        <div v-if="summary.latest" class="text-muted font-13 q-mt-xs">
          <span class="font-mono">{{ summary.latest.name }}</span
          >, {{ summary.latest.state.toLowerCase() }}
        </div>
        <div v-if="summary.latest && summary.latest !== summary.latestSuccess" class="font-13 q-mt-xs health--yellow">
          last success {{ summary.latestSuccess?.startTime ? formatTimeAgo(summary.latestSuccess.startTime) : 'never' }}
        </div>
      </pulse-metric-card>
    </div>

    <div class="col-12 col-sm-6 col-lg-3">
      <pulse-metric-card
        title="Failed / partial"
        icon="report"
        :value="problems"
        :value-class="summary.failed.length ? 'health--red' : summary.partial.length ? 'health--yellow' : undefined"
        test-id="snapshots-pulse-problems"
      >
        <template v-if="problems">
          <div class="text-muted font-13 q-mt-xs">{{ summary.failed.length }} failed, {{ summary.partial.length }} partial</div>
          <div v-if="summary.firstFailure" class="text-muted font-13 font-mono q-mt-xs ellipsis" :title="summary.firstFailure">
            {{ summary.firstFailure }}
          </div>
        </template>
        <div v-else class="text-muted font-13 q-mt-xs">All snapshots completed</div>
      </pulse-metric-card>
    </div>

    <div class="col-12 col-sm-6 col-lg-3">
      <pulse-metric-card
        title="Running"
        icon="sync"
        :value="runningValue"
        :value-class="running?.length ? 'health--yellow' : undefined"
        test-id="snapshots-pulse-running"
      >
        <div v-for="snapshot in running?.slice(0, 2)" :key="snapshot.snapshot" class="text-muted font-13 q-mt-xs">
          <span class="font-mono">{{ snapshot.snapshot }}</span>
          <template v-if="snapshot.percent !== null">, {{ formatPercent(snapshot.percent) }} shards</template>
        </div>
        <div v-if="running && !running.length" class="text-muted font-13 q-mt-xs">No snapshot running</div>
        <div v-if="summary.avgDurationMs !== null" class="text-muted font-13 q-mt-xs">
          avg duration {{ formatTime(summary.avgDurationMs) }}
        </div>
      </pulse-metric-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import PulseMetricCard from '../shared/PulseMetricCard.vue'
import { formatPercent } from '../../helpers/pressure.ts'
import { formatTime, formatTimeAgo } from '../../helpers/time.ts'
import type { RunningSnapshot, SnapshotsSummary } from '../../types/snapshots.ts'

const props = defineProps<{
  summary: SnapshotsSummary
  running: RunningSnapshot[] | null
}>()

const problems = computed(() => props.summary.failed.length + props.summary.partial.length)

const stateBreakdown = computed(() =>
  props.summary.states.map(({ name, count }) => `${count} ${name.toLowerCase().replace('_', ' ')}`).join(', ')
)

const latestClass = computed(() => {
  const state = props.summary.latest?.state
  if (state === 'FAILED') return 'health--red'
  if (state && state !== 'SUCCESS') return 'health--yellow'
  return undefined
})

const runningValue = computed(() => {
  if (!props.running) return null
  if (props.running.length === 1 && props.running[0].percent !== null) return formatPercent(props.running[0].percent)
  return props.running.length
})
</script>
