<template>
  <v-card>
    <v-card-title>
      <h2>Cluster Health</h2>
      <v-btn flat icon class="ml-a" v-on:click="loadClusterHealth">
        <v-icon>cached</v-icon>
      </v-btn>
    </v-card-title>
    <v-divider></v-divider>

    <content-or-loading :loading="loading">
      <v-list dense>
        <v-list-tile class="list__tile--selectable" v-for="key in Object.keys(clusterHealth)" :key="key">
          <v-list-tile-content>{{key}}</v-list-tile-content>
          <v-list-tile-content class="align-end">
            <v-chip :class="clusterHealth[key]" v-if="key === 'status'">{{clusterHealth[key]}}</v-chip>
            <span v-else>{{clusterHealth[key]}}</span>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </content-or-loading>
  </v-card>
</template>

<script>
  import { flattenObject } from '../../helpers/utilities'

  export default {
    data () {
      return {
        clusterHealth: {},
        loading: false
      }
    },
    created () {
      this.loadClusterHealth()
    },
    methods: {
      loadClusterHealth () {
        this.loading = true
        this.getElasticsearchAdapter().then(adapter => adapter.getClusterHealth()).then(
          body => {
            this.clusterHealth = flattenObject(body, true, true)
            this.loading = false
          }
        ).catch(error => this.$store.commit('setErrorState', error))
      }
    }
  }
</script>
