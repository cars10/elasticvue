<template>
  <v-card>
    <v-card-title>
      <h1 class="headline">Document</h1>
      <reload-button :action="() => $refs.dataLoader.loadData()"/>
      <back-button :route="{name: 'Search', params: {executeSearch: true}}"/>
    </v-card-title>
    <v-divider/>

    <v-card-text>
      <data-loader ref="dataLoader" :method-params="methodParams" method="get">
        <template v-slot:default="data">
          <print-pretty :document="data.body" :caption="caption"/>
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
    name: 'Document',
    components: {
      BackButton,
      DataLoader,
      PrintPretty,
      ReloadButton
    },
    computed: {
      params () {
        return this.$route.params
      },
      methodParams () {
        return { index: this.params.index, type: this.params.type, id: this.params.id }
      },
      caption () {
        return `${this.params.index} / ${this.params.type} / ${this.params.id}`
      }
    }
  }
</script>
