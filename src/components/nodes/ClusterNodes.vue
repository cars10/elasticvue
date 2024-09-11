<template>
  <div>
    <q-card class="q-mb-md">
      <q-card-section class="flex items-center">
        <h1 class="text-h5 q-my-none">
          {{ t('cluster_nodes.heading') }}
        </h1>
        <reload-button :action="load" />
      </q-card-section>

      <q-separator />

      <loader-status :request-state="requestState">
        <nodes-table :nodes="data || []" />
      </loader-status>
    </q-card>

    <q-card class="inline-block text-body2">
      <q-card-section class="q-pa-sm">
        <table class="text-muted">
          <tbody>
            <tr>
              <td>
                <q-icon name="star" size="xs" />
              </td>
              <td>{{ t('cluster_nodes.node_icons.master.title') }}</td>
            </tr>
            <tr>
              <td>
                <q-icon name="star_outline" size="xs" />
              </td>
              <td>{{ t('cluster_nodes.node_icons.master_eligible.title') }}</td>
            </tr>
            <tr>
              <td>
                <q-icon name="save" size="xs" />
              </td>
              <td>{{ t('cluster_nodes.node_icons.data.title') }}</td>
            </tr>
            <tr>
              <td>
                <q-icon name="drive_file_move" size="xs" />
              </td>
              <td>{{ t('cluster_nodes.node_icons.ingest.title') }}</td>
            </tr>
            <tr>
              <td>
                <q-icon name="route" size="xs" />
              </td>
              <td>{{ t('cluster_nodes.node_icons.coordinating_only.title') }}</td>
            </tr>
          </tbody>
        </table>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, Ref, ref } from 'vue'
  import ReloadButton from '../shared/ReloadButton.vue'
  import LoaderStatus from '../shared/LoaderStatus.vue'
  import NodesTable from './NodesTable.vue'
  import { useElasticsearchAdapter } from '../../composables/CallElasticsearch'
  import { useTranslation } from '../../composables/i18n'
  import { EsNode, NodeAttributes } from '../../types/types.ts'
  import { flattenObj } from '../../helpers/flatten.ts'

  const t = useTranslation()

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
      'disk.total'
    ],
    full_id: true
  }

  const data: Ref<EsNode[]> = ref([])
  const { requestState, callElasticsearch } = useElasticsearchAdapter()
  const load = async () => {
    data.value = []
    const catNodes = callElasticsearch('catNodes', CAT_METHOD_PARAMS)
    const nodesInfo = callElasticsearch('nodes')

    const [nodes, nodeAttributes]: [EsNode[], NodeAttributes] = await Promise.all([catNodes, nodesInfo])

    data.value = nodes.map(node => {
      const attributes = flattenObj(nodeAttributes.nodes[node.id]?.settings?.node?.attr)
      return Object.assign({}, node, { attributes })
    })
  }

  onMounted(load)
</script>
