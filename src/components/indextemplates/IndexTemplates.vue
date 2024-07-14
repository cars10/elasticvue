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
      <index-templates-table :index-templates="data || []" />
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

  const t = useTranslation()

  const { data, requestState, load } = useIndexTemplates()

  onMounted(load)
</script>
