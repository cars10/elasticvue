<template>
  <q-card class="full-height" data-testid="cluster-indices">
    <q-card-section class="row items-center justify-between">
      <div class="text-weight-medium">{{ t('home.indices.title', { count: totalCount }) }}</div>
      <router-link :to="{ name: 'indices', params: { clusterIndex: connectionStore.activeClusterIndex } }" class="font-13">
        {{ t('home.indices.all') }}
      </router-link>
    </q-card-section>

    <q-card-section v-if="indices.length" class="q-pt-none text-muted font-13">
      {{ tableHint }}
    </q-card-section>

    <q-markup-table v-if="indices.length" flat dense wrap-cells>
      <thead>
        <tr>
          <th class="text-left">{{ t('home.indices.index') }}</th>
          <th class="text-left">{{ t('home.indices.health') }}</th>
          <th class="text-right">{{ t('home.indices.docs') }}</th>
          <th class="text-right">{{ t('home.indices.size') }}</th>
          <th class="text-right">{{ t('home.metrics.shards') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="index in indices" :key="index.index">
          <td class="text-left text-weight-medium">{{ index.index }}</td>
          <td class="text-left font-13" :class="`health--${index.health}`">{{ healthLabel(index.health) }}</td>
          <td class="text-right tabular-nums">{{ index.docs }}</td>
          <td class="text-right tabular-nums">{{ prettyBytes(index.sizeBytes) }}</td>
          <td class="text-right tabular-nums">{{ index.shards }}</td>
        </tr>
      </tbody>
    </q-markup-table>

    <q-card-section v-else class="text-muted font-13">{{ t('home.indices.empty') }}</q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import prettyBytes from 'pretty-bytes'
import { useConnectionStore } from '../../store/connection.ts'
import type { OverviewIndex } from '../../types/homeDashboard.ts'
import { useTranslation } from '../../composables/i18n.ts'
import { useHealthLabel } from '../../composables/HealthLabel.ts'

const props = defineProps<{
  indices: OverviewIndex[]
  /** Eligible non-system indices (before top-N). */
  totalCount: number
}>()

const connectionStore = useConnectionStore()
const t = useTranslation()
const healthLabel = useHealthLabel()

const tableHint = computed(() => {
  const shown = props.indices.length
  if (shown >= props.totalCount) return t('home.indices.hint_all', { count: shown })
  return t('home.indices.hint_top', { shown, total: props.totalCount })
})
</script>
