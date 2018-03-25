<template>
  <div>
    <v-card>
      <v-card-title>
        <h2>Node Information</h2>
      </v-card-title>
      <v-divider></v-divider>
      <v-list dense>
        <v-list-tile v-for="key in Object.keys(clientInformation)" :key="key">
          <v-list-tile-content>{{key}}</v-list-tile-content>
          <v-list-tile-content class="align-end">{{clientInformation[key]}}</v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-card>
  </div>
</template>

<script>
  import ElasticsearchAdapter from '../../services/ElasticsearchAdapter'
  import { flattenObject } from '../../helpers/utilities'

  export default {
    data () {
      return {
        clientInformation: {}
      }
    },
    created () {
      let adapter = new ElasticsearchAdapter(this.$store.state.connection.elasticsearchClient)
      adapter.getClientInfo().then(
        body => (this.clientInformation = flattenObject(body, true, true)),
        error => this.$store.commit('setErrorState', error)
      )
    }
  }
</script>
