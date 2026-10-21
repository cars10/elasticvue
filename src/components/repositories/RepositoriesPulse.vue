<template>
  <div class="row q-col-gutter-lg" data-testid="repositories-pulse">
    <div class="col-12 col-sm-6 col-lg-3">
      <pulse-metric-card title="Repositories" icon="inventory_2" :value="summary.total" test-id="repositories-pulse-total">
        <div class="text-muted font-13 q-mt-xs">{{ typeBreakdown }}</div>
        <div v-if="summary.readonly" class="text-muted font-13 q-mt-xs">{{ summary.readonly }} read-only</div>
      </pulse-metric-card>
    </div>

    <div class="col-12 col-sm-6 col-lg-3">
      <pulse-metric-card
        title="Running now"
        icon="sync"
        :value="running?.length ?? null"
        :value-class="running?.length ? 'health--yellow' : undefined"
        test-id="repositories-pulse-running"
      >
        <template v-if="running?.length">
          <div v-for="snapshot in running.slice(0, 2)" :key="snapshot.snapshot" class="text-muted font-13 q-mt-xs">
            <span class="font-mono">{{ snapshot.repository }}/{{ snapshot.snapshot }}</span>
            <template v-if="snapshot.percent !== null">, {{ formatPercent(snapshot.percent) }} shards</template>
          </div>
        </template>
        <div v-else-if="running" class="text-muted font-13 q-mt-xs">No snapshot running</div>
      </pulse-metric-card>
    </div>

    <div class="col-12 col-sm-6 col-lg-3">
      <pulse-metric-card
        title="Snapshot policies"
        icon="policy"
        :value="slm ? summary.policies : null"
        test-id="repositories-pulse-policies"
      >
        <template v-if="slm">
          <template v-if="summary.failingPolicies.length">
            <div class="font-13 q-mt-xs health--red">{{ summary.failingPolicies.length }} failing</div>
          </template>
          <div v-else-if="summary.policies" class="text-muted font-13 q-mt-xs">All policies healthy</div>
          <div v-else class="text-muted font-13 q-mt-xs">No automated snapshots configured</div>
        </template>
        <div v-else class="text-muted font-13 q-mt-xs">{{ slmHint }}</div>
      </pulse-metric-card>
    </div>

    <div class="col-12 col-sm-6 col-lg-3">
      <pulse-metric-card
        title="Last policy success"
        icon="history"
        :value="slm && summary.lastSuccess ? formatTimeAgo(summary.lastSuccess.time) : null"
        :value-class="summary.failingPolicies.length ? 'health--yellow' : undefined"
        test-id="repositories-pulse-last-success"
      >
        <template v-if="slm">
          <div v-if="summary.lastSuccess" class="text-muted font-13 q-mt-xs">{{ summary.lastSuccess.policy }}</div>
          <div v-if="summary.nextRun" class="text-muted font-13 q-mt-xs">
            next run {{ formatTimeIn(summary.nextRun.time) }} ({{ summary.nextRun.policy }})
          </div>
        </template>
        <div v-else class="text-muted font-13 q-mt-xs">{{ slmHint }}</div>
      </pulse-metric-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import PulseMetricCard from '../shared/PulseMetricCard.vue'
import { formatPercent } from '../../helpers/pressure.ts'
import { formatTimeAgo, formatTimeIn } from '../../helpers/time.ts'
import type { RepositoriesSummary, RunningSnapshot } from '../../types/snapshots.ts'

const props = defineProps<{
  summary: RepositoriesSummary
  running: RunningSnapshot[] | null
  slm: boolean
  slmHint: string
}>()

const typeBreakdown = computed(() => props.summary.types.map(({ name, count }) => `${count} ${name}`).join(', '))
</script>
