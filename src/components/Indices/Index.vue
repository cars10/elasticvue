<template>
  <v-layout>
    <v-flex lg8 offset-lg2>
      <v-card>
        <v-card-title>
          <h1 class="headline">Index</h1>
          <reload-button :action="() => this.$refs.dataLoader.loadData()"></reload-button>
          <back-button :route="{name: 'Indices'}"></back-button>
        </v-card-title>
        <v-divider></v-divider>

        <v-card-text>
          <h2 class="subheading">{{indexName}}</h2>
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
    name: 'Index',
    computed: {
      indexName () {
        return this.$route.params.index
      }
    },
    components: {
      PrintPrettyOrRaw,
      BackButton
    }
  }
</script>
