<template>
  <v-card>
    <v-card-title>
      <h1 class="text-h5">Index stats</h1>
      <reload-button id="reload-indices" :action="() => this.$refs.dataLoader.loadData()"/>
      <back-button :route="{name: 'Indices'}"/>
    </v-card-title>
    <v-divider/>

    <v-card-text>
      <data-loader ref="dataLoader" :method-params="{index: indexName}" method="indexStats">
        <template v-slot:default="data">
          <print-pretty :caption="indexName" :document="data.body"/>
        </template>
      </data-loader>
    </v-card-text>
  </v-card>
</template>

<script>
  import BackButton from '@/components/shared/BackButton'
  import DataLoader from '@/components/shared/DataLoader'
  import PrintPretty from '@/components/shared/PrintPretty'
  import ReloadButton from '@/components/shared/ReloadButton'

  export default {
    name: 'index-stats',
    components: {
      BackButton,
      DataLoader,
      PrintPretty,
      ReloadButton
    },
    computed: {
      indexName () {
        return this.$route.params.index
      }
    }
  }
</script>
