<template>
  <div>
    <div class="row no-wrap items-center q-gutter-x-sm">
      <div class="col-auto tabular-nums metric-bar__value" :class="pressureTextClass(level)">
        {{ formatPercent(value) }}
      </div>
      <q-linear-progress class="col" :value="ratio" :color="pressureBarColor(level)" size="10px" rounded instant-feedback />
    </div>
    <div v-if="detail" class="text-muted font-13 tabular-nums q-mt-xs">{{ detail }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatPercent, pressureBarColor, pressureLevel, pressureTextClass, type Thresholds } from '../../helpers/pressure.ts'

const props = defineProps<{
  value?: number | null
  /** Omit to render a neutral bar without warning colors. */
  thresholds?: Thresholds
  detail?: string | null
}>()

const level = computed(() => pressureLevel(props.value, props.thresholds))

const ratio = computed(() => {
  if (props.value == null || Number.isNaN(props.value)) return 0
  return Math.min(100, Math.max(0, props.value)) / 100
})
</script>

<style scoped>
.metric-bar__value {
  min-width: 4ch;
  text-align: right;
}
</style>
