<template>
  <div>
    <v-card>
      <v-card-title>
        <h2>Node Information</h2>
        <v-btn flat icon class="ml-a" v-on:click="loadClientInfo">
          <v-icon>cached</v-icon>
        </v-btn>
      </v-card-title>
      <v-divider></v-divider>

      <content-or-loading :loading="loading">
        <v-list dense>
          <v-list-tile v-for="key in Object.keys(clientInformation)" :key="key">
            <v-list-tile-content>{{key}}</v-list-tile-content>
            <v-list-tile-content class="align-end">{{clientInformation[key]}}</v-list-tile-content>
          </v-list-tile>
        </v-list>
      </content-or-loading>
    </v-card>
  </div>
</template>

<script>
  import { flattenObject } from '../../helpers/utilities'

  export default {
    data () {
      return {
        clientInformation: {},
        loading: false
      }
    },
    created () {
      this.loadClientInfo()
    },
    methods: {
      loadClientInfo () {
        this.loading = true
        this.getElasticsearchAdapter().getClientInfo().then(
          body => {
            this.clientInformation = flattenObject(body, true, true)
            this.loading = false
          },
          error => this.$store.commit('setErrorState', error)
        )
      }
    }
  }
</script>
