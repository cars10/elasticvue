<template>
  <div class="flex justify-between items-center q-mb-lg">
    <h1 class="page-title">{{ t('index_templates.heading') }}</h1>
    <reload-button :action="load" v-model="indexTemplatesStore.reloadInterval" />
  </div>

  <index-templates-pulse v-if="templates.length" class="q-mb-lg" :summary="summary" :composable-supported="composableSupported" />

  <q-card>
    <loader-status :request-state="requestState">
      <index-templates-table :index-templates="templates" />
    </loader-status>
  </q-card>
</template>

<script setup lang="ts">
import ReloadButton from '../shared/ReloadButton.vue'
import LoaderStatus from '../shared/LoaderStatus.vue'
import IndexTemplatesTable from './IndexTemplatesTable.vue'
import IndexTemplatesPulse from './IndexTemplatesPulse.vue'
import { useTranslation } from '../../composables/i18n.ts'
import { useIndexTemplates } from '../../composables/components/indextemplates/IndexTemplates.ts'

const t = useTranslation()
const { indexTemplatesStore, requestState, templates, composableSupported, summary, load } = useIndexTemplates()
</script>
