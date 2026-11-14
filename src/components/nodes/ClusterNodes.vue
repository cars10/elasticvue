<template>
  <div class="flex justify-between items-center q-mb-lg">
    <h1 class="page-title">{{ t('cluster_nodes.heading') }}</h1>
    <reload-button :action="load" v-model="nodesStore.reloadInterval" />
  </div>

  <nodes-pulse
    v-if="nodes.length"
    class="q-mb-lg"
    :summary="summary"
    :disk-watermarks="diskWatermarks"
    :cpu-history="cpuHistory"
    :heap-history="heapHistory"
  />

  <q-card>
    <loader-status :request-state="requestState">
      <nodes-table :nodes="nodes" :loading="requestState.loading" :disk-watermarks="diskWatermarks" />
    </loader-status>
  </q-card>
</template>

<script setup lang="ts">
import LoaderStatus from '../shared/LoaderStatus.vue'
import ReloadButton from '../shared/ReloadButton.vue'
import NodesPulse from './NodesPulse.vue'
import NodesTable from './NodesTable.vue'
import { useTranslation } from '../../composables/i18n'
import { useNodesStore } from '../../store/nodes.ts'
import { useClusterNodes } from '../../composables/components/nodes/ClusterNodes.ts'

const t = useTranslation()
const nodesStore = useNodesStore()

const { requestState, nodes, summary, diskWatermarks, cpuHistory, heapHistory, load } = useClusterNodes()
</script>
