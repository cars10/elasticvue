<template>
  <div class="row q-col-gutter-md" data-testid="shards-pulse">
    <div :class="colClass">
      <pulse-metric-card :title="t('home.metrics.shards')" icon="view_module" :value="summary.total" test-id="shards-pulse-total">
        <div class="text-muted font-13 q-mt-xs">
          {{ t('shards.pulse.split', { primaries: summary.primaries, replicas: summary.replicas }) }}
        </div>
        <div class="text-muted font-13 q-mt-xs">{{ t('shards.pulse.indices', { count: summary.indices }, summary.indices) }}</div>
      </pulse-metric-card>
    </div>

    <div :class="colClass">
      <pulse-metric-card
        :title="t('shards.pulse.unassigned')"
        icon="report"
        :value="summary.unassigned"
        :value-class="unassignedClass"
        test-id="shards-pulse-unassigned"
      >
        <template v-if="summary.unassigned">
          <div class="font-13 q-mt-xs" :class="unassignedClass">
            {{
              t('shards.pulse.split', {
                primaries: summary.unassignedPrimaries,
                replicas: summary.unassigned - summary.unassignedPrimaries
              })
            }}
          </div>
          <div
            v-for="{ reason, count } in summary.unassignedReasons.slice(0, 2)"
            :key="reason"
            class="text-muted font-13 font-mono"
          >
            {{ reason }} ×{{ count }}
          </div>
        </template>
        <div v-else class="text-muted font-13 q-mt-xs">{{ t('home.overview.all_assigned') }}</div>
      </pulse-metric-card>
    </div>

    <div :class="colClass">
      <pulse-metric-card
        :title="t('shards.pulse.moving')"
        icon="sync_alt"
        :value="moving"
        :value-class="moving ? 'health--yellow' : undefined"
        test-id="shards-pulse-moving"
      >
        <div class="text-muted font-13 q-mt-xs">
          {{ t('shards.pulse.moving_split', { relocating: summary.relocating, initializing: summary.initializing }) }}
        </div>
        <router-link :to="{ name: 'shard_recovery', params: { clusterIndex } }" class="font-13">
          {{ t('shards.pulse.view_recovery') }}
        </router-link>
      </pulse-metric-card>
    </div>

    <div v-if="summary.spread" :class="colClass">
      <shard-balance-card :spread="summary.spread" test-id="shards-pulse-balance" />
    </div>

    <div :class="colClass">
      <pulse-metric-card
        :title="t('shards.pulse.size')"
        icon="straighten"
        :value="summary.avgPrimaryBytes == null ? null : prettyPrintByteString(Math.round(summary.avgPrimaryBytes))"
        :unit="t('shards.pulse.avg_primary')"
        test-id="shards-pulse-size"
      >
        <div v-if="summary.largest" class="text-muted font-13 q-mt-xs">
          {{ t('shards.pulse.largest', { size: prettyPrintByteString(summary.largest.bytes) }) }}
          <span class="font-mono">({{ summary.largest.index }} {{ summary.largest.prirep }}{{ summary.largest.shard }})</span>
        </div>
        <div v-if="summary.oversized" class="font-13 q-mt-xs health--yellow">
          {{ t('shards.pulse.oversized', { count: summary.oversized, size: prettyPrintByteString(OVERSIZED_SHARD_BYTES) }) }}
        </div>
      </pulse-metric-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import PulseMetricCard from '../shared/PulseMetricCard.vue'
import ShardBalanceCard from './ShardBalanceCard.vue'
import { useTranslation } from '../../composables/i18n.ts'
import { prettyPrintByteString } from '../../helpers/bytes.ts'
import { OVERSIZED_SHARD_BYTES } from '../../helpers/shards.ts'
import { useConnectionStore } from '../../store/connection.ts'
import type { ShardsSummary } from '../../types/shards.ts'

const props = defineProps<{ summary: ShardsSummary }>()

const t = useTranslation()
const clusterIndex = useConnectionStore().activeClusterIndex

const colClass = computed(() => (props.summary.spread ? 'col-12 col-sm-6 col-lg' : 'col-12 col-sm-6 col-lg-3'))

const moving = computed(() => props.summary.initializing + props.summary.relocating)

const unassignedClass = computed(() => {
  if (props.summary.unassignedPrimaries) return 'health--red'
  if (props.summary.unassigned) return 'health--yellow'
  return undefined
})
</script>
