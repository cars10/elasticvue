<template>
  <div class="row q-col-gutter-lg" data-testid="indices-pulse">
    <div class="col-12 col-sm-6 col-lg-3">
      <pulse-metric-card title="Indices" icon="list" :value="summary.total" test-id="indices-pulse-total">
        <div class="text-muted font-13 q-mt-xs">{{ summary.open }} open, {{ summary.closed }} closed</div>
        <div class="text-muted font-13 q-mt-xs">
          {{ formatCount(summary.primaries) }} primary, {{ formatCount(summary.replicas) }} replica shards
        </div>
      </pulse-metric-card>
    </div>

    <div class="col-12 col-sm-6 col-lg-3">
      <pulse-metric-card
        title="Health"
        icon="monitor_heart"
        :value="worstHealth"
        :value-class="`health--${worstHealth}`"
        test-id="indices-pulse-health"
      >
        <div class="text-muted font-13 q-mt-xs">
          {{ summary.health.green }} green, {{ summary.health.yellow }} yellow, {{ summary.health.red }} red
        </div>
      </pulse-metric-card>
    </div>

    <div class="col-12 col-sm-6 col-lg-3">
      <pulse-metric-card
        title="Storage"
        icon="storage"
        :value="prettyPrintByteString(summary.storeBytes)"
        test-id="indices-pulse-storage"
      >
        <div class="text-muted font-13 q-mt-xs">{{ formatCount(summary.docs) }} documents</div>
        <div v-if="summary.largest" class="text-muted font-13 q-mt-xs ellipsis" :title="summary.largest.index">
          largest <span class="font-mono">{{ summary.largest.index }}</span
          >,
          {{ prettyPrintByteString(summary.largest.storeBytes) }}
        </div>
      </pulse-metric-card>
    </div>

    <div class="col-12 col-sm-6 col-lg-3">
      <pulse-metric-card
        title="Read-only"
        icon="lock"
        :value="summary.readOnly"
        :value-class="summary.diskBlocked.length ? 'health--red' : undefined"
        test-id="indices-pulse-read-only"
      >
        <template v-if="summary.readOnly === null">
          <div class="text-muted font-13 q-mt-xs">Could not load index settings</div>
        </template>
        <template v-else-if="summary.diskBlocked.length">
          <div class="font-13 q-mt-xs health--red">{{ summary.diskBlocked.length }} blocked by disk watermark</div>
          <router-link :to="{ name: 'nodes', params: { clusterIndex } }" class="font-13">Check node disks</router-link>
        </template>
        <div v-else-if="summary.readOnly" class="text-muted font-13 q-mt-xs">Indices with a write block</div>
        <div v-else class="text-muted font-13 q-mt-xs">All indices writable</div>
      </pulse-metric-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import PulseMetricCard from '../shared/PulseMetricCard.vue'
import { prettyPrintByteString } from '../../helpers/bytes.ts'
import { formatCount } from '../../helpers/nodes.ts'
import { useConnectionStore } from '../../store/connection.ts'
import type { IndicesSummary } from '../../types/indices.ts'

const props = defineProps<{ summary: IndicesSummary }>()

const clusterIndex = useConnectionStore().activeClusterIndex

const worstHealth = computed(() => {
  if (props.summary.health.red) return 'red'
  if (props.summary.health.yellow) return 'yellow'
  return 'green'
})
</script>
