<template>
  <content-or-connect>
    <v-card>
      <v-card-title>
        <h2>Indices</h2>
        <v-btn flat icon v-on:click="loadIndices">
          <v-icon>cached</v-icon>
        </v-btn>
      </v-card-title>
      <v-divider></v-divider>
      <indices-table :indices="indices" :loading="loading"></indices-table>
    </v-card>
  </content-or-connect>
</template>

<script>
  import IndicesTable from '@/components/Indices/IndicesTable'

  export default {
    data () {
      return {
        indices: [],
        loading: false
      }
    },
    components: {
      IndicesTable
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
