<template>
  <div class="row q-col-gutter-lg" data-testid="recovery-pulse">
    <div class="col-12 col-sm-6 col-lg-3">
      <pulse-metric-card
        title="Active"
        icon="sync"
        :value="summary.active"
        :value-class="summary.active ? 'health--yellow' : undefined"
        unit="recoveries"
        test-id="recovery-pulse-active"
      >
        <div v-if="summary.active" class="text-muted font-13 q-mt-xs">{{ typeBreakdown }}</div>
        <div v-else class="text-muted font-13 q-mt-xs">No shards are recovering</div>
        <div v-if="completedLoaded" class="text-muted font-13 q-mt-xs">{{ summary.completed }} completed</div>
      </pulse-metric-card>
    </div>

    <div class="col-12 col-sm-6 col-lg-3">
      <pulse-metric-card
        title="Progress"
        icon="downloading"
        :value="formatPercent(summary.percent)"
        unit="copied"
        test-id="recovery-pulse-progress"
      >
        <div v-if="summary.bytesTotal" class="text-muted font-13 q-mt-xs">
          {{ prettyPrintByteString(summary.bytesRecovered) }} of {{ prettyPrintByteString(summary.bytesTotal) }}
        </div>
        <div v-else class="text-muted font-13 q-mt-xs">Nothing to copy</div>
      </pulse-metric-card>
    </div>

    <div class="col-12 col-sm-6 col-lg-3">
      <pulse-metric-card
        title="Longest running"
        icon="timer"
        :value="summary.longest?.durationMs == null ? null : formatTime(summary.longest.durationMs)"
        test-id="recovery-pulse-longest"
      >
        <div v-if="summary.longest" class="text-muted font-13 q-mt-xs">
          <span class="font-mono"
            >{{ summary.longest.index }} {{ summary.longest.primary ? 'p' : 'r' }}{{ summary.longest.shard }}</span
          >
          → {{ summary.longest.targetNode || '—' }}
        </div>
      </pulse-metric-card>
    </div>

    <div class="col-12 col-sm-6 col-lg-3">
      <pulse-metric-card
        title="Throttled"
        icon="speed"
        :value="summary.throttleMs ? formatTime(summary.throttleMs) : '0s'"
        :value-class="summary.throttleMs ? 'health--yellow' : undefined"
        test-id="recovery-pulse-throttle"
      >
        <template v-if="summary.throttleMs">
          <div class="font-13 q-mt-xs health--yellow">Recovery bandwidth limit reached</div>
          <router-link :to="{ name: 'tools', params: { clusterIndex } }" class="font-13">Adjust in Tools</router-link>
        </template>
        <div v-else class="text-muted font-13 q-mt-xs">Active recoveries are not throttled</div>
      </pulse-metric-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import PulseMetricCard from '../shared/PulseMetricCard.vue'
import { prettyPrintByteString } from '../../helpers/bytes.ts'
import { formatPercent } from '../../helpers/pressure.ts'
import { formatTime } from '../../helpers/time.ts'
import { useConnectionStore } from '../../store/connection.ts'
import type { RecoverySummary } from '../../types/shardRecovery.ts'

const props = defineProps<{ summary: RecoverySummary; completedLoaded: boolean }>()

const clusterIndex = useConnectionStore().activeClusterIndex

const typeBreakdown = computed(() => props.summary.activeTypes.map(({ type, count }) => `${count} ${type}`).join(', '))
</script>
