<template>
  <v-card>
    <back-button alignLeft :route="{name: 'Browse', params: {executeSearch: true}}" text="Back to search"></back-button>
    <v-card-title>
      <h2>{{this.params.index}} / {{this.params.type}} / {{this.params.id}}</h2>
    </v-card-title>
    <v-divider></v-divider>

    <v-card-text>
      <v-tabs>
        <v-tab key="tab1">Collapsible</v-tab>
        <v-tab key="tab2">Raw</v-tab>

        <v-tab-item key="tab1">
          <v-flex pa-3>
            <vue-print-object :printableObject="document" v-if="document"></vue-print-object>
          </v-flex>
        </v-tab-item>

        <v-tab-item key="tab2">
          <v-flex pa-3>
            <pre class="scroll-y">{{document}}</pre>
          </v-flex>
        </v-tab-item>
      </v-tabs>
    </v-card-text>
  </v-card>
</template>

<script>
  import BackButton from '@/components/shared/BackButton'
  import VuePrintObject from 'vue-print-object'

  export default {
    data () {
      return {
        document: null,
        params: this.$route.params
      }
    },
    created () {
      this.getElasticsearchAdapter().then(
        adapter => adapter.get({index: this.params.index, type: this.params.type, id: this.params.id})
      ).then(
        body => (this.document = body),
        error => this.$store.commit('setErrorState', error)
      )
    },
    components: {
      BackButton,
      VuePrintObject
    }
  }
</script>
