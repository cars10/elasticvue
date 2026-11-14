<template>
  <q-card class="full-height" :data-testid="testId">
    <q-card-section>
      <div class="card-title">
        <q-icon :name="icon" size="18px" />
        {{ title }}
      </div>
      <div v-if="unavailable" class="text-muted font-13">{{ t('home.monitoring_required') }}</div>

      <div v-else class="row no-wrap q-gutter-x-md">
        <div class="col" style="min-width: 0">
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
import { useTranslation } from '../../composables/i18n.ts'

const t = useTranslation()

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
    size: 84,
    testId: undefined
  }
)
</script>
