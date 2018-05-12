<template>
  <v-card>
    <back-button alignLeft :route="{name: 'Browse', params: {executeSearch: true}}" text="Back to search"></back-button>
    <v-card-title>
      <h2>{{this.params.index}} / {{this.params.type}} / {{this.params.id}}</h2>
      <reload-button alignLeft :action="() => this.$refs.dataLoader.loadData()"></reload-button>
    </v-card-title>
    <v-divider></v-divider>

    <v-card-text>
      <data-loader method="get" :methodParams="methodParams" ref="dataLoader">
        <template slot-scope="data">
          <print-pretty-or-raw :document="data.body"></print-pretty-or-raw>
        </template>
      </data-loader>
    </v-card-text>
  </v-card>
</template>

<script>
  import BackButton from '@/components/shared/BackButton'
  import PrintPrettyOrRaw from '@/components/shared/PrintPrettyOrRaw'

  export default {
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
      PrintPrettyOrRaw
    }
  }
</script>
