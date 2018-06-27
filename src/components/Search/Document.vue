<template>
  <v-card>
    <v-card-title>
      <h1 class="headline">Document</h1>
      <reload-button :action="() => $refs.dataLoader.loadData()"></reload-button>
      <back-button :route="{name: 'Search', params: {executeSearch: true}}"></back-button>
    </v-card-title>
    <v-divider></v-divider>

    <v-card-text>
      <h2 class="subheading">{{this.params.index}} / {{this.params.type}} / {{this.params.id}}</h2>
      <data-loader method="get" :methodParams="methodParams" ref="dataLoader">
        <template slot-scope="data">
          <print-pretty :document="data.body"></print-pretty>
        </template>
      </data-loader>
    </v-card-text>
  </v-card>
</template>

<script>
  import BackButton from '@/components/shared/BackButton'
  import PrintPretty from '@/components/shared/PrintPretty'

  export default {
    name: 'Document',
    computed: {
      params () {
        return this.$route.params
      },
      methodParams () {
        let params = this.params
        return {index: params.index, type: params.type, id: params.id}
      }
    },
    components: {
      BackButton,
      PrintPretty
    }
  }
</script>
