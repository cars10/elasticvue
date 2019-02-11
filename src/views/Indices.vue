<template>
  <v-card>
    <v-card-title>
      <h2 class="headline">Indices</h2>
      <reload-button id="reload-indices" :action="() => $refs.dataLoader.loadData()"/>
    </v-card-title>
    <v-divider/>

    <data-loader ref="dataLoader" method="catIndices" render-content-while-loading>
      <template v-slot:default="data">
        <indices-table :indices="data.body || []" :loading="data.loading" @reloadIndices="reloadIndices"/>
      </template>
    </data-loader>
  </v-card>
</template>

<script>
  import IndicesTable from '@/components/Indices/IndicesTable'
  import ReloadButton from '@/components/shared/ReloadButton'

  export default {
    name: 'Indices',
    components: {
      IndicesTable,
      ReloadButton
    },
    methods: {
      reloadIndices () {
        this.$refs.dataLoader.loadData()
      }
    }
  }
</script>
