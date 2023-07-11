<template>
  <q-card>
    <q-card-section class="flex items-center">
      <h1 class="text-h5 q-my-none">
        {{ t('index_templates.heading') }}
      </h1>
      <reload-button :action="load" />
    </q-card-section>

    <q-separator />

    <loader-status :request-state="requestState">
      <index-templates-table :index-templates="data || {}" />
    </loader-status>
  </q-card>
</template>

<script setup lang="ts">
  import { onMounted } from 'vue'
  import ReloadButton from '../shared/ReloadButton.vue'
  import LoaderStatus from '../shared/LoaderStatus.vue'
  import IndexTemplatesTable from './IndexTemplatesTable.vue'
  import { useElasticsearchRequest } from '../../composables/CallElasticsearch'
  import { useTranslation } from '../../composables/i18n.ts'
  import { EsIndexTemplates } from '../../composables/components/indextemplates/IndexTemplatesTable.ts'

  const t = useTranslation()

  const { requestState, data, load } = useElasticsearchRequest<EsIndexTemplates>('catIndexTemplates')
  onMounted(load)
</script>
