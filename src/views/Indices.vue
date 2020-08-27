<template>
  <v-card>
    <v-card-title>
      <h2 class="text-h5">Indices</h2>
      <reload-button id="reload-indices" :action="load"/>
    </v-card-title>
    <v-divider/>

    <indices-table :indices="data || []" :loading="requestState.loading" @reloadIndices="load"/>
  </v-card>
</template>

<script>
  import IndicesTable from '@/components/Indices/IndicesTable'
  import ReloadButton from '@/components/shared/ReloadButton'
  import { setupElasticsearchRequest } from '@/mixins/RequestComposition'
  import { onMounted } from '@vue/composition-api'

  export default {
    name: 'indices',
    components: {
      IndicesTable,
      ReloadButton
    },
    setup () {
      const CAT_INDICES_PARAMS = { h: 'index,health,status,uuid,pri,rep,docs.count,store.size', bytes: 'b' }
      const { load, requestState, data } = setupElasticsearchRequest('catIndices', CAT_INDICES_PARAMS)
      onMounted(load)

      return {
        load,
        requestState,
        data
      }
    }
  }
</script>
