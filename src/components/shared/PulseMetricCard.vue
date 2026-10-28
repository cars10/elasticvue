<template>
  <q-card class="full-height" :data-testid="testId">
    <q-card-section>
      <div class="card-title">
        <q-icon :name="icon" size="18px" />
        {{ title }}
      </div>

      <div class="metric-value">
        <slot name="value">
          <span :class="valueClass">{{ value ?? '—' }}</span>
          <span v-if="unit" class="text-muted font-13 text-weight-regular q-ml-xs">{{ unit }}</span>
        </slot>
      </div>

      <line-chart v-if="history && history.length > 1" class="q-mt-sm" :values="history" :height="48" />

      <slot />
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import LineChart from './LineChart.vue'

defineProps<{
  title: string
  icon: string
  /** Headline value; use the `value` slot for custom markup. */
  value?: string | number | null
  unit?: string
  valueClass?: string
  /** Sparkline below the value, shown once there are at least two samples. */
  history?: number[]
  testId?: string
}>()
</script>
