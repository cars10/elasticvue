<template>
  <div class="flex justify-between items-center q-mb-md">
    <h1 class="text-h4 q-my-none">{{ t('cluster_nodes.heading') }}</h1>
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

  <div>
    <nodes-table :nodes="nodes" :loading="requestState.loading" :disk-watermarks="diskWatermarks">
      <q-select
        v-model="nodesStore.nodeRoles"
        :options="nodeRoleOptions"
        option-value="value"
        option-label="label"
        emit-value
        map-options
        :label="t('cluster_nodes.node_role')"
        multiple
        dense
        outlined
        style="width: 200px"
      />
    </nodes-table>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ReloadButton from '../shared/ReloadButton.vue'
import NodesPulse from './NodesPulse.vue'
import NodesTable from './NodesTable.vue'
import { useTranslation } from '../../composables/i18n'
import { useNodesStore } from '../../store/nodes.ts'
import { useClusterNodes } from '../../composables/components/nodes/ClusterNodes.ts'

const t = useTranslation()
const nodesStore = useNodesStore()

const { requestState, nodes, summary, diskWatermarks, cpuHistory, heapHistory, load } = useClusterNodes()

const nodeRoleOptions = computed(() => [
  { value: 'm', label: t('cluster_nodes.node_icons.master_eligible.title') },
  { value: 'd', label: t('cluster_nodes.node_icons.data.title') },
  { value: 'i', label: t('cluster_nodes.node_icons.ingest.title') },
  { value: '-', label: t('cluster_nodes.node_icons.coordinating_only.title') },
  { value: 'c', label: t('cluster_nodes.node_icons.cold.title') },
  { value: 'f', label: t('cluster_nodes.node_icons.frozen.title') },
  { value: 'h', label: t('cluster_nodes.node_icons.hot.title') },
  { value: 'l', label: t('cluster_nodes.node_icons.ml.title') },
  { value: 'r', label: t('cluster_nodes.node_icons.remote_cluster_client.title') },
  { value: 's', label: t('cluster_nodes.node_icons.content.title') },
  { value: 't', label: t('cluster_nodes.node_icons.transform.title') },
  { value: 'v', label: t('cluster_nodes.node_icons.voting_only.title') },
  { value: 'w', label: t('cluster_nodes.node_icons.warm.title') }
])
</script>
