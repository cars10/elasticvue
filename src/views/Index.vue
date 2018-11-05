<template>
  <v-card>
    <v-card-title>
      <h1 class="headline">Index</h1>
      <reload-button id="reload-indices" :action="() => this.$refs.dataLoader.loadData()"/>
      <back-button :route="{name: 'Indices'}"/>
    </v-card-title>
    <v-divider/>

    <v-card-text>
      <data-loader ref="dataLoader" :method-params="{index: indexName}" method="indicesGet">
        <template slot-scope="data">
          <print-pretty :document="data.body" :caption="indexName"/>
        </template>
      </data-loader>
    </v-card-text>
  </v-card>
</template>

<script>
  import BackButton from '@/components/shared/BackButton'
  import PrintPretty from '@/components/shared/PrintPretty'

  export default {
    name: 'Index',
    components: {
      PrintPretty,
      BackButton
    },
    computed: {
      indexName () {
        return this.$route.params.index
      }
    }
  }
</script>
