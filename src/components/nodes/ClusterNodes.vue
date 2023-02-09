<template>
  <q-card>
    <q-card-section class="flex items-center">
      <h1 class="text-h5 q-my-none">
        {{ $t('nodes.nodes_list.heading') }}
      </h1>
      <reload-button :action="load" />
    </q-card-section>

    <q-separator />

    <loader-status :request-state="requestState">
      <nodes-table :nodes="data || []" />
    </loader-status>
  </q-card>
</template>
<script setup>
  import { onMounted } from 'vue'
  import ReloadButton from '../shared/ReloadButton.vue'
  import LoaderStatus from '../shared/LoaderStatus.vue'
  import NodesTable from './NodesTable.vue'
  import { useElasticsearchRequest } from '../../composables/CallElasticsearch'

  const CAT_METHOD_PARAMS = {
    h: [
      'ip',
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
    ]
  }

  const { load, requestState, data } = useElasticsearchRequest('catNodes', CAT_METHOD_PARAMS)
  onMounted(load)
</script>
