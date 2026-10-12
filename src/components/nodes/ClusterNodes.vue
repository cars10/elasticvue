<template>
  <div class="flex justify-between items-center q-mb-md">
    <h1 class="text-h4 q-my-none">{{ t('cluster_nodes.heading') }}</h1>
    <reload-button :action="load" v-model="nodesStore.reloadInterval" />
  </div>

  <div>
    <nodes-table :nodes="data || []" :loading="requestState.loading">
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
import { computed, onMounted, Ref, ref } from 'vue'
import ReloadButton from '../shared/ReloadButton.vue'
import NodesTable from './NodesTable.vue'
import { useElasticsearchAdapter } from '../../composables/CallElasticsearch'
import { useTranslation } from '../../composables/i18n'
import { EsNode, NodeAttributes } from '../../types/types.ts'
import { flattenObj } from '../../helpers/flatten.ts'
import { useNodesStore } from '../../store/nodes.ts'

const t = useTranslation()
const nodesStore = useNodesStore()

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

const CAT_METHOD_PARAMS = {
  h: [
    'ip',
    'id',
    'name',
    'version',
    'heap.percent',
    'heap.current',
    'heap.max',
    'ram.percent',
    'ram.current',
    'ram.max',
    'node.role',
    'master',
    'cpu',
    'load_1m',
    'load_5m',
    'load_15m',
    'disk.used_percent',
    'disk.used',
    'disk.total',
    'shards' // es >= 8
  ],
  full_id: true
}

const data: Ref<EsNode[]> = ref([])
const { requestState, callElasticsearch } = useElasticsearchAdapter()
const { callElasticsearch: callEnrichment } = useElasticsearchAdapter()
const load = async () => {
  try {
    const nodes = (await callElasticsearch('catNodes', CAT_METHOD_PARAMS)) as EsNode[]

    let nodeAttributes: NodeAttributes = { nodes: {} }
    try {
      nodeAttributes = (await callEnrichment('nodes')) as NodeAttributes
    } catch {
      // Attributes are enrichment; listing nodes should still work without them
    }

    const next = nodes.map((node) => {
      const attributes = flattenObj(nodeAttributes.nodes[node.id]?.settings?.node?.attr)
      return Object.assign({}, node, { attributes })
    })

    // Keep the current rows when the payload is unchanged so the table does not remount.
    if (JSON.stringify(data.value) !== JSON.stringify(next)) data.value = next
  } catch (e) {
    console.error(e)
  }
}

onMounted(load)
</script>
