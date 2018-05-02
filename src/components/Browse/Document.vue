<template>
  <v-card>
    <v-btn @click="returnToSearch">Back to search</v-btn>
    <v-card-title>
      {{this.params.index}} / {{this.params.type}} / {{this.params.id}}
    </v-card-title>
    <v-card-text>
      <vue-print-object :printableObject="document" v-if="document"></vue-print-object>
    </v-card-text>
  </v-card>
</template>

<script>
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
      VuePrintObject
    },
    methods: {
      returnToSearch () {
        this.$router.push({name: 'Browse', params: {executeSearch: true}})
      }
    }
  }
</script>
