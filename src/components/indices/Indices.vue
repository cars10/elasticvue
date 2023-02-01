<template>
  <q-card>
    <q-card-section>
      <h2 class="text-h5 q-my-none d-inline-block">
        {{ $t('indices.heading') }}
      </h2>
      <reload-button :action="load" />
    </q-card-section>

    <q-separator />

    <loader-status :request-state="requestState">
      <indices-table :indices="data || []" @reload="load" />
    </loader-status>
  </q-card>
</template>

<script setup>
  import IndicesTable from './IndicesTable.vue'
  import { useElasticsearchRequest } from '../../composables/RequestComposition'
  import { onMounted } from 'vue'
  import LoaderStatus from '../shared/LoaderStatus.vue'
  import ReloadButton from '../shared/ReloadButton.vue'

  const CAT_INDICES_PARAMS = { h: 'index,health,status,uuid,pri,rep,docs.count,store.size', bytes: 'b' }
  const { requestState, data, load } = useElasticsearchRequest('catIndices', CAT_INDICES_PARAMS)

  onMounted(load)
</script>
