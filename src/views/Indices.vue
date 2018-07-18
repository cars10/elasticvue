<template>
  <v-card>
    <v-card-title>
      <h2 class="headline">Indices</h2>
      <reload-button :action="() => $refs.dataLoader.loadData()"/>
    </v-card-title>
    <v-divider/>

    <data-loader ref="dataLoader" method="catIndices" render-content-while-loading>
      <template slot-scope="data">
        <indices-table :indices="data.body || []" :loading="data.loading" @deleteIndex="removeIndex"/>
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
      removeIndex () {
        this.$refs.dataLoader.loadData()
      }
    }
  }
</script>
