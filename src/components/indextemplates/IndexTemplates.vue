<template>
  <q-card>
    <q-card-section>
      <h2 class="text-h5 q-my-none d-inline-block">
        {{ $t('index_templates.heading') }}
      </h2>
      <reload-button :action="load" />
    </q-card-section>

    <q-separator />

    <loader-status :request-state="requestState">
      <index-templates-table :index-templates="data?.index_templates || []" />
    </loader-status>
  </q-card>
</template>

<script setup>
  import { onMounted } from 'vue'
  import ReloadButton from '../shared/ReloadButton.vue'
  import LoaderStatus from '../shared/LoaderStatus.vue'
  import IndexTemplatesTable from './IndexTemplatesTable.vue'
  import { useElasticsearchRequest } from '../../composables/RequestComposition'

  const { requestState, data, load } = useElasticsearchRequest('catIndexTemplates')
  onMounted(load)
</script>
