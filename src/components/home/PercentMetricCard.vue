<template>
  <q-card class="full-height" :data-testid="testId">
    <q-card-section>
      <div v-if="unavailable" class="text-muted font-13 q-mt-sm">Monitoring permission required</div>

      <div v-else class="row no-wrap q-gutter-x-md q-mt-sm">
        <div class="col">
          <div class="text-weight-bold q-mb-md flex items-center">
            <q-icon :name="icon" size="22px" class="q-mr-sm" color="primary" />
            {{ title }}
          </div>

          <slot />
        </div>
        <percent-pie-chart
          class="col-auto"
          :value="value"
          :warn-at="warnAt"
          :danger-at="dangerAt"
          :higher-is-better="higherIsBetter"
          :size="size"
        />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import PercentPieChart from '../shared/PercentPieChart.vue'

withDefaults(
  defineProps<{
    title: string
    icon?: string
    value: number | null
    unavailable?: boolean
    warnAt?: number
    dangerAt?: number
    higherIsBetter?: boolean
    size?: number
    testId?: string
  }>(),
  {
    unavailable: false,
    warnAt: 75,
    dangerAt: 85,
    higherIsBetter: false,
    size: 100,
    testId: undefined
  }
)
</script>
