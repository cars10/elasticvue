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
          <v-tabs>
            <v-tab key="tab1">Collapsible</v-tab>
            <v-tab key="tab2">Raw</v-tab>

            <v-tab-item key="tab1">
              <v-flex pa-3>
                <vue-print-object :printableObject="data.body"></vue-print-object>
              </v-flex>
            </v-tab-item>

            <v-tab-item key="tab2">
              <v-flex pa-3>
                <pre class="scroll-y">{{data.body}}</pre>
              </v-flex>
            </v-tab-item>
          </v-tabs>
        </template>
      </data-loader>
    </v-card-text>
  </v-card>
</template>

<script>
  import BackButton from '@/components/shared/BackButton'
  import VuePrintObject from 'vue-print-object'

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
      VuePrintObject
    }
  }
</script>
