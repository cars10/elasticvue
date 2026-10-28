<template>
  <pulse-metric-card
    :title="t('shards.pulse.balance')"
    icon="view_module"
    :value="range"
    :value-class="unbalanced ? 'health--yellow' : undefined"
    :unit="t('shards.pulse.per_data_node')"
    :test-id="testId"
  >
    <div class="text-muted font-13 q-mt-xs">{{ t('shards.pulse.avg', { count: Math.round(spread.avg) }) }}</div>
    <div v-if="spread.nodes > 1" class="font-13 q-mt-xs" :class="unbalanced ? 'health--yellow' : 'text-muted'">
      {{ t('shards.pulse.busiest', { node: spread.busiest, skew: spread.skew.toFixed(1) }) }}
    </div>
  </pulse-metric-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import PulseMetricCard from '../shared/PulseMetricCard.vue'
import { useTranslation } from '../../composables/i18n.ts'
import { spreadUnbalanced } from '../../helpers/nodeStats.ts'
import type { NodeSpread } from '../../types/shards.ts'

const props = defineProps<{
  spread: NodeSpread
  testId?: string
}>()

const t = useTranslation()

const range = computed(() =>
  props.spread.min === props.spread.max ? String(props.spread.max) : `${props.spread.min}-${props.spread.max}`
)

const unbalanced = computed(() => spreadUnbalanced(props.spread))
</script>
