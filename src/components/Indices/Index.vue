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

        <v-card-text>
          <data-loader method="indicesGet" :methodParams="{index: indexName}" ref="dataLoader">
            <template slot-scope="data">
              <print-pretty-or-raw :document="data.body"></print-pretty-or-raw>
            </template>
          </data-loader>
        </v-card-text>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
  import BackButton from '@/components/shared/BackButton'
  import PrintPrettyOrRaw from '@/components/shared/PrintPrettyOrRaw'

  export default {
    components: {
      PrintPrettyOrRaw,
      BackButton
    },
    computed: {
      indexName () {
        return this.$route.params.index
      }
    }
  }
</script>
