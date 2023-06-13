<template>
  <q-card>
    <q-card-section class="flex items-center">
      <h1 class="text-h5 q-my-none">
        {{ t('indices.heading') }}
      </h1>
      <reload-button :action="load" />
    </q-card-section>

    <q-separator />

    <loader-status :request-state="requestState">
      <indices-table :indices="data || []" @reload="load" />
    </loader-status>
  </q-card>
</template>

<script setup lang="ts">
  import IndicesTable from './IndicesTable.vue'
  import { useElasticsearchRequest } from '../../composables/CallElasticsearch'
  import { onMounted } from 'vue'
  import LoaderStatus from '../shared/LoaderStatus.vue'
  import ReloadButton from '../shared/ReloadButton.vue'
  import { useTranslation } from '../../composables/i18n.ts'

  const t = useTranslation()

  const CAT_INDICES_PARAMS = { h: 'index,health,status,uuid,pri,rep,docs.count,store.size', bytes: 'b' }
  const { requestState, data, load } = useElasticsearchRequest('catIndices', CAT_INDICES_PARAMS)
  onMounted(load)
</script>
