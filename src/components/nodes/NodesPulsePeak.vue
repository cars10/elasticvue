<template>
  <div v-if="peak.node" class="font-13 q-mt-xs">
    <i18n-t scope="global" keypath="cluster_nodes.pulse.peak" tag="span" class="text-muted">
      <template #value>
        <span :class="pressureTextClass(pressureLevel(peak.value, thresholds)) || 'text-muted'">
          {{ formatPercent(peak.value) }}
        </span>
      </template>
      <template #node>{{ peak.node }}</template>
    </i18n-t>
    <div v-if="peak.detail" class="text-muted font-mono">{{ peak.detail }}</div>
  </div>
</template>

<script setup lang="ts">
import { formatPercent, pressureLevel, pressureTextClass, type Thresholds } from '../../helpers/pressure.ts'
import type { MetricPeak } from '../../types/homeDashboard.ts'

defineProps<{
  peak: MetricPeak
  thresholds: Thresholds
}>()
</script>
