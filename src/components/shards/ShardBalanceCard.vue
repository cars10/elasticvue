<template>
  <pulse-metric-card
    title="Shard balance"
    icon="view_module"
    :value="range"
    :value-class="unbalanced ? 'health--yellow' : undefined"
    unit="per data node"
    :test-id="testId"
  >
    <div class="text-muted font-13 q-mt-xs">avg {{ Math.round(spread.avg) }}</div>
    <div v-if="spread.nodes > 1" class="font-13 q-mt-xs" :class="unbalanced ? 'health--yellow' : 'text-muted'">
      most on {{ spread.busiest }} ({{ spread.skew.toFixed(1) }}× avg)
    </div>
  </pulse-metric-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import PulseMetricCard from '../shared/PulseMetricCard.vue'
import { spreadUnbalanced } from '../../helpers/nodeStats.ts'
import type { NodeSpread } from '../../types/shards.ts'

const props = defineProps<{
  spread: NodeSpread
  testId?: string
}>()

const range = computed(() =>
  props.spread.min === props.spread.max ? String(props.spread.max) : `${props.spread.min}–${props.spread.max}`
)

const unbalanced = computed(() => spreadUnbalanced(props.spread))
</script>
