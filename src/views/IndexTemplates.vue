<template>
  <v-card>
    <v-card-title>
      <h2 class="text-h5">{{ $t('index_templates.heading') }}</h2>
      <reload-button :action="load"/>
    </v-card-title>
    <v-divider/>

    <loader :request-state="requestState" hide-progress>
      <index-templates-table :indexTemplates="data?.index_templates || []" :loading="requestState.loading"
                             @reloadIndices="load"/>
    </loader>
  </v-card>
</template>

<script>
  import IndexTemplatesTable from '@/components/IndexTemplates/IndexTemplatesTable'
  import ReloadButton from '@/components/shared/ReloadButton'
  import { setupElasticsearchRequest } from '@/mixins/RequestComposition'
  import Loader from '@/components/shared/Loader'
  import { onMounted } from 'vue'

  export default {
    name: 'index-templates',
    components: {
      Loader,
      IndexTemplatesTable,
      ReloadButton
    },
    setup () {
      const { load, requestState, data } = setupElasticsearchRequest('catIndexTemplates')
      onMounted(load)

      return {
        load,
        requestState,
        data
      }
    }
  }
</script>
