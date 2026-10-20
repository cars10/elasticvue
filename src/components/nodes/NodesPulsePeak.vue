<template>
  <div v-if="peak.node" class="font-13 q-mt-xs">
    <span class="text-muted">peak </span>
    <span :class="pressureTextClass(pressureLevel(peak.value, thresholds)) || 'text-muted'">
      {{ formatPercent(peak.value) }}
    </span>
    <span class="text-muted"> on {{ peak.node }}</span>
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
