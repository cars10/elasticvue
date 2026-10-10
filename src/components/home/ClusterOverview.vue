<template>
  <div class="row q-col-gutter-xl">
    <div class="col-12 col-md-6 flex">
      <q-card class="full-width col">
        <q-card-section>
          <div class="text-h4 text-weight-bold">
            {{ stats.cluster_name }}
          </div>
          <div v-if="versionLabel" class="q-mt-sm">{{ versionLabel }}</div>
          <div v-if="stats.cluster_uuid" class="text-muted font-13 font-mono q-mt-xs">
            {{ stats.cluster_uuid }}
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
import type { ClusterStats } from '../../types/homeDashboard.ts'

const props = defineProps<{
  stats: ClusterStats
  versionLabel: string | null
}>()

const diskLabel = computed(() => prettyPrintByteString(props.stats.indices.store.size_in_bytes))
</script>
