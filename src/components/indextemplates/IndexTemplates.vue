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
      <index-templates-table :index-templates="data || []">
        <q-select v-if="clusterVersionGte(7)"
                  v-model="endpoint" :options="endpointOptions" :label="t('index_templates.endpoint')" dense outlined
                  class="q-mr-md" style="min-width: 140px" />
      </index-templates-table>
    </loader-status>
  </q-card>
</template>

<script setup lang="ts">
  import { onMounted } from 'vue'
  import ReloadButton from '../shared/ReloadButton.vue'
  import LoaderStatus from '../shared/LoaderStatus.vue'
  import IndexTemplatesTable from './IndexTemplatesTable.vue'
  import { useTranslation } from '../../composables/i18n.ts'
  import { useIndexTemplates } from '../../composables/components/indextemplates/IndexTemplates.ts'
  import { clusterVersionGte } from '../../helpers/minClusterVersion.ts'

  const t = useTranslation()

  const { data, requestState, load, endpoint, endpointOptions } = useIndexTemplates()

  onMounted(load)
</script>
