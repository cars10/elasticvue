<template>
  <div class="row q-col-gutter-xl">
    <div class="col-12 col-md-6 flex">
      <q-card class="full-width col">
        <q-card-section class="row no-wrap items-start q-col-gutter-md">
          <div class="col" style="min-width: 0">
            <div class="text-h4 text-weight-bold ellipsis">
              {{ stats.cluster_name }}
            </div>
            <div v-if="versionLabel" class="q-mt-sm">{{ versionLabel }}</div>
            <div v-if="stats.cluster_uuid" class="text-muted font-13 font-mono q-mt-xs ellipsis">
              {{ stats.cluster_uuid }}
            </div>
          </div>

          <div class="col-auto text-right" data-testid="cluster-status">
            <div class="cluster-status" :class="`cluster-status--${status || 'unknown'}`">
              <span class="cluster-status__dot" />
              <span class="text-capitalize">{{ status || 'unknown' }}</span>
            </div>
            <div class="text-muted font-13 q-mt-sm">{{ statusSummary }}</div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <div class="col-6 col-md-3 flex">
      <q-card class="full-width col" data-testid="cluster-nodes-summary">
        <q-card-section>
          <div class="text-weight-bold q-mb-md flex items-center">
            <q-icon name="dns" size="22px" class="q-mr-sm" color="primary" />
            {{ stats.nodes.count.total }} Nodes
          </div>
          <div class="q-gutter-y-xs">
            <div v-if="stats.nodes.count.data != null">{{ stats.nodes.count.data }} data</div>
            <div v-if="stats.nodes.count.master != null">{{ stats.nodes.count.master }} masters</div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <div class="col-6 col-md-3 flex">
      <q-card class="full-width col" data-testid="cluster-indices-summary">
        <q-card-section>
          <div class="text-weight-bold q-mb-md flex items-center">
            <q-icon name="storage" size="22px" class="q-mr-sm" color="primary" />
            {{ stats.indices.count }} Indices
          </div>
          <div class="q-gutter-y-xs">
            <div>{{ stats.indices.docs.count }} docs</div>
            <div>{{ diskLabel }} disk</div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { prettyPrintByteString } from '../../helpers/bytes'
import type { ClusterHealth, ClusterStats } from '../../types/homeDashboard.ts'

const props = defineProps<{
  stats: ClusterStats
  health: ClusterHealth | null
  status: string
  versionLabel: string | null
}>()

const statusSummary = computed(() => {
  const unassigned = props.health?.unassigned_shards ?? 0
  if (unassigned > 0) return `${unassigned} unassigned shards`
  const initializing = (props.health?.initializing_shards ?? 0) + (props.health?.relocating_shards ?? 0)
  if (initializing > 0) return `${initializing} shards moving`
  return 'All shards assigned'
})

const diskLabel = computed(() => prettyPrintByteString(props.stats.indices.store.size_in_bytes))
</script>

<style scoped>
.cluster-status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  border-radius: 999px;
  font-weight: 600;
  /* Pull text towards the theme's text color so yellow stays readable on light backgrounds */
  color: color-mix(in srgb, var(--status-color) 70%, var(--theme-color));
  background: color-mix(in srgb, var(--status-color) 14%, transparent);
  border: 1px solid color-mix(in srgb, var(--status-color) 35%, transparent);
}

.cluster-status__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--status-color);
}

.cluster-status--green {
  --status-color: var(--theme-positive);
}

.cluster-status--yellow {
  --status-color: var(--theme-warning);
}

.cluster-status--red {
  --status-color: var(--theme-negative);
}

.cluster-status--unknown {
  --status-color: var(--theme-muted-color);
}
</style>
