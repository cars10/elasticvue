<template>
  <v-card>
    <back-button alignLeft :route="{name: 'Browse', params: {executeSearch: true}}" text="Back to search"></back-button>
    <v-card-title>
      {{this.params.index}} / {{this.params.type}} / {{this.params.id}}
    </v-card-title>
    <v-card-text>
      <vue-print-object :printableObject="document" v-if="document"></vue-print-object>
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
