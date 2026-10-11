<template>
  <q-card class="full-height" data-testid="cluster-indices">
    <q-card-section class="row items-center justify-between">
      <div>Indices ({{ totalCount }})</div>
      <router-link :to="{ name: 'indices', params: { clusterIndex: connectionStore.activeClusterIndex } }" class="font-13">
        All indices
      </router-link>
    </q-card-section>

    <q-card-section v-if="indices.length" class="q-pt-none text-muted font-13">
      {{ tableHint }}
    </q-card-section>

    <q-markup-table v-if="indices.length" flat dense wrap-cells>
      <thead>
        <tr>
          <th class="text-left">Index</th>
          <th class="text-left">Health</th>
          <th class="text-right">Docs</th>
          <th class="text-right">Size</th>
          <th class="text-right">Shards</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="index in indices" :key="index.index">
          <td class="text-left text-weight-medium">{{ index.index }}</td>
          <td class="text-left text-uppercase font-13" :class="`health--${index.health}`">{{ index.health }}</td>
          <td class="text-right font-mono">{{ index.docs }}</td>
          <td class="text-right font-mono">{{ prettyBytes(index.sizeBytes) }}</td>
          <td class="text-right font-mono">{{ index.shards }}</td>
        </tr>
      </tbody>
    </q-markup-table>

    <q-card-section v-else class="text-muted font-13">No indices to show.</q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import prettyBytes from 'pretty-bytes'
import { useConnectionStore } from '../../store/connection.ts'
import type { OverviewIndex } from '../../types/homeDashboard.ts'

const props = defineProps<{
  indices: OverviewIndex[]
  /** Eligible non-system indices (before top-N). */
  totalCount: number
}>()

const connectionStore = useConnectionStore()

const tableHint = computed(() => {
  const shown = props.indices.length
  if (shown >= props.totalCount) {
    return `Showing all ${shown} — unhealthy first, then largest by size.`
  }
  return `Showing top ${shown} of ${props.totalCount} — unhealthy first, then largest by size.`
})
</script>
