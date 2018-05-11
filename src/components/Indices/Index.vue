<template>
  <v-layout>
    <v-flex xs6 offset-xs3>
      <v-card>
        <v-card-title>
          <h2>Index</h2>
          <reload-button alignLeft :action="() => this.$refs.dataLoader.loadData()"></reload-button>
          <back-button :route="{name: 'Indices'}"></back-button>
        </v-card-title>
        <v-divider></v-divider>

        <data-loader method="indicesGet" :methodParams="indexName" ref="dataLoader">
          <template slot-scope="data">
            <v-card-text>
              <vue-print-object :printableObject="data.body"></vue-print-object>
            </v-card-text>
          </template>
        </data-loader>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
  import BackButton from '@/components/shared/BackButton'
  import VuePrintObject from 'vue-print-object'

  export default {
    components: {
      VuePrintObject,
      BackButton
    },
    computed: {
      indexName () {
        return this.$route.params.index
      }
    }
  }
</script>
