<template>
  <div>
    <q-card class="q-mb-md">
      <q-card-section class="flex items-center">
        <h1 class="text-h5 q-my-none">
          {{ t('nodes.nodes_list.heading') }}
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
          <tr>
            <td>
              <q-icon name="star" size="xs" />
            </td>
            <td>{{ t('nodes.node_icons.master.title') }}</td>
          </tr>
          <tr>
            <td>
              <q-icon name="star_outline" size="xs" />
            </td>
            <td>{{ t('nodes.node_icons.master_eligible.title') }}</td>
          </tr>
          <tr>
            <td>
              <q-icon name="save" size="xs" />
            </td>
            <td>{{ t('nodes.node_icons.data.title') }}</td>
          </tr>
          <tr>
            <td>
              <q-icon name="drive_file_move" size="xs" />
            </td>
            <td>{{ t('nodes.node_icons.ingest.title') }}</td>
          </tr>
          <tr>
            <td>
              <q-icon name="route" size="xs" />
            </td>
            <td>{{ t('nodes.node_icons.coordinating_only.title') }}</td>
          </tr>
        </table>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
  import { onMounted } from 'vue'
  import ReloadButton from '../shared/ReloadButton.vue'
  import LoaderStatus from '../shared/LoaderStatus.vue'
  import NodesTable from './NodesTable.vue'
  import { useElasticsearchRequest } from '../../composables/CallElasticsearch'
  import { useTranslation } from '../../composables/i18n'
  import { EsNode } from '../../types/types.ts'

  const t = useTranslation()
  const CAT_METHOD_PARAMS = {
    h: [
      'ip',
      'id',
      'name',
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

  const { load, requestState, data } = useElasticsearchRequest<EsNode[]>('catNodes', CAT_METHOD_PARAMS)
  onMounted(load)
</script>
