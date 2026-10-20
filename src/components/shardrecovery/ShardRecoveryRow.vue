<template>
  <tr>
    <td>
      <div class="text-weight-medium">{{ recovery.index }}</div>
      <div class="text-muted font-13">{{ recovery.primary ? 'primary' : 'replica' }} shard {{ recovery.shard }}</div>
    </td>
    <td>
      <q-badge outline color="primary" :label="recovery.type" />
    </td>
    <td>
      <q-badge v-if="recovery.active" color="warning" text-color="dark" :label="recovery.stage" />
      <span v-else class="text-muted">{{ recovery.stage }}</span>
    </td>
    <td>
      <div class="row items-center no-wrap q-gutter-x-sm">
        <div>
          <div>{{ recovery.sourceNode || '—' }}</div>
          <div class="text-muted font-13">{{ recovery.sourceHost }}</div>
        </div>
        <q-icon name="arrow_forward" class="text-muted" />
        <div>
          <div>{{ recovery.targetNode || '—' }}</div>
          <div class="text-muted font-13">{{ recovery.targetHost }}</div>
        </div>
      </div>
    </td>
    <td class="progress-cell">
      <metric-bar :value="recovery.bytesPercent" :detail="bytesDetail" />
    </td>
    <td>
      <div>{{ formatPercent(recovery.filesPercent) }}</div>
      <div class="text-muted font-13">{{ countDetail(recovery.filesRecovered, recovery.filesTotal) }}</div>
    </td>
    <td>
      <div>{{ formatPercent(recovery.translogPercent) }}</div>
      <div class="text-muted font-13">{{ countDetail(recovery.translogRecovered, recovery.translogTotal) }}</div>
    </td>
    <td class="text-right">{{ recovery.durationMs == null ? '—' : formatTime(recovery.durationMs) }}</td>
    <td :title="recovery.stopTime ? `finished ${new Date(recovery.stopTime).toLocaleString()}` : undefined">
      <template v-if="recovery.startTime">
        <div>{{ new Date(recovery.startTime).toLocaleDateString() }}</div>
        <div class="text-muted font-13">{{ new Date(recovery.startTime).toLocaleTimeString() }}</div>
      </template>
      <template v-else>—</template>
    </td>
    <td class="text-right" :class="{ 'health--yellow': recovery.active && recovery.throttleMs > 0 }">
      {{ recovery.throttleMs > 0 ? formatTime(recovery.throttleMs) : '—' }}
    </td>
  </tr>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import MetricBar from '../shared/MetricBar.vue'
import { prettyPrintByteString } from '../../helpers/bytes.ts'
import { formatCount } from '../../helpers/nodes.ts'
import { formatPercent } from '../../helpers/pressure.ts'
import { formatTime } from '../../helpers/time.ts'
import type { ShardRecovery } from '../../types/shardRecovery.ts'

const props = defineProps<{ recovery: ShardRecovery }>()

const bytesDetail = computed(() => {
  const { bytesRecovered, bytesTotal } = props.recovery
  if (bytesRecovered == null || bytesTotal == null) return null
  return `${prettyPrintByteString(bytesRecovered)} / ${prettyPrintByteString(bytesTotal)}`
})

const countDetail = (recovered: number | null, total: number | null) =>
  recovered == null || total == null ? '' : `${formatCount(recovered)} / ${formatCount(total)}`
</script>

<style scoped>
.progress-cell {
  min-width: 160px;
}
</style>
