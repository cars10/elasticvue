<template>
  <div class="row q-col-gutter-md">
    <div class="col-12 col-md-6 flex">
      <q-card class="full-width col">
        <q-card-section class="row no-wrap items-start q-col-gutter-md">
          <div class="col" style="min-width: 0">
            <div class="cluster-name ellipsis">{{ connectionStore.activeCluster?.name }}</div>
            <div v-if="stats.cluster_name !== connectionStore.activeCluster?.name" class="text-muted ellipsis">
              {{ stats.cluster_name }}
            </div>
            <div v-if="versionLabel" class="q-mt-sm">{{ versionLabel }}</div>
            <div v-if="stats.cluster_uuid" class="text-muted font-13 font-mono q-mt-xs ellipsis">
              {{ stats.cluster_uuid }}
            </div>
          </div>

          <div class="col-auto text-right" data-testid="cluster-status">
            <health-badge :status="status" />
            <div class="text-muted font-13 q-mt-sm">{{ statusSummary }}</div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <div class="col-6 col-md-3 flex">
      <q-card class="full-width col" data-testid="cluster-nodes-summary">
        <q-card-section>
          <div class="card-title">
            <q-icon name="dns" size="18px" />
            {{ t('home.overview.nodes', { count: stats.nodes.count.total }, stats.nodes.count.total) }}
          </div>
          <div class="q-gutter-y-xs">
            <div v-if="stats.nodes.count.data != null">{{ t('home.overview.data', { count: stats.nodes.count.data }) }}</div>
            <div v-if="stats.nodes.count.master != null">
              {{ t('home.overview.master_eligible', { count: stats.nodes.count.master }) }}
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <div class="col-6 col-md-3 flex">
      <q-card class="full-width col" data-testid="cluster-indices-summary">
        <q-card-section>
          <div class="card-title">
            <q-icon name="storage" size="18px" />
            {{ t('home.overview.indices', { count: stats.indices.count }, stats.indices.count) }}
          </div>
          <div class="q-gutter-y-xs">
            <div>{{ t('home.overview.docs', { count: stats.indices.docs.count }, stats.indices.docs.count) }}</div>
            <div>{{ t('home.overview.disk', { size: diskLabel }) }}</div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { prettyPrintByteString } from '../../helpers/bytes'
import { useTranslation } from '../../composables/i18n.ts'
import HealthBadge from '../shared/HealthBadge.vue'
import { useConnectionStore } from '../../store/connection.ts'
import type { ClusterHealth, ClusterStats } from '../../types/homeDashboard.ts'

const props = defineProps<{
  stats: ClusterStats
  health: ClusterHealth | null
  status: string
  versionLabel: string | null
}>()

const t = useTranslation()
const connectionStore = useConnectionStore()

const statusSummary = computed(() => {
  const unassigned = props.health?.unassigned_shards ?? 0
  if (unassigned > 0) return t('home.overview.unassigned', { count: unassigned }, unassigned)
  const moving = (props.health?.initializing_shards ?? 0) + (props.health?.relocating_shards ?? 0)
  if (moving > 0) return t('home.overview.moving', { count: moving }, moving)
  return t('home.overview.all_assigned')
})

const diskLabel = computed(() => prettyPrintByteString(props.stats.indices.store.size_in_bytes))
</script>

<style scoped>
.cluster-name {
  font-size: 26px;
  font-weight: 600;
  line-height: 1.2;
}
</style>
