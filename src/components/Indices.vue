<template>
  <v-card>
    <v-card-title>
      <h2 class="headline">Indices</h2>
      <reload-button alignLeft :action="() => $refs.dataLoader.loadData()"></reload-button>
    </v-card-title>
    <v-divider></v-divider>

    <data-loader method="getCatIndices" ref="dataLoader" renderContentWhileLoading>
      <template slot-scope="data">
        <indices-table :indices="data.body || []" v-on:deleteIndex="removeIndex" :loading="data.loading"></indices-table>
      </template>
    </data-loader>
  </v-card>
</template>

<script>
  import IndicesTable from '@/components/Indices/IndicesTable'
  import ReloadButton from '@/components/shared/ReloadButton'

  export default {
    name: 'Indices',
    methods: {
      removeIndex () {
        this.$refs.dataLoader.loadData()
      }
    },
    components: {
      IndicesTable,
      ReloadButton
    }
  }
</script>
