<template>
  <v-card>
    <v-card-title>
      <h2>Indices</h2>
      <reload-button alignLeft :action="loadIndices"></reload-button>
    </v-card-title>
    <v-divider></v-divider>
    <indices-table :indices="indices" :loading="loading"></indices-table>
  </v-card>
</template>

<script>
  import IndicesTable from '@/components/Indices/IndicesTable'
  import ReloadButton from '@/components/shared/ReloadButton'

  export default {
    data () {
      return {
        indices: [],
        loading: false
      }
    },
    components: {
      IndicesTable,
      ReloadButton
    },
    created () {
      this.loadIndices()
    },
    methods: {
      loadIndices () {
        this.loading = true

        this.getElasticsearchAdapter().then(adapter => adapter.getCatIndices()).then(
          indices => {
            this.indices = indices
            this.loading = false
          }
        ).catch(error => this.$store.commit('setErrorState', error))
      }
    }
  }
</script>
