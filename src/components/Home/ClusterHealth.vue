<template>
  <div>
    <v-card>
      <v-card-title>
        <h2>Cluster Health</h2>
        <v-btn flat icon class="ml-a" v-on:click="loadClusterHealth">
          <v-icon>cached</v-icon>
        </v-btn>
      </v-card-title>
      <v-divider></v-divider>

      <v-progress-linear v-if="loading" color="blue" indeterminate></v-progress-linear>
      <v-list v-else dense>
        <v-list-tile v-for="key in Object.keys(clusterHealth)" :key="key">
          <v-list-tile-content>{{key}}</v-list-tile-content>
          <v-list-tile-content class="align-end">
            <v-chip :class="clusterHealth[key]" v-if="key === 'status'">{{clusterHealth[key]}}</v-chip>
            <span v-else>{{clusterHealth[key]}}</span>
          </v-list-tile-content>
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
        let adapter = new ElasticsearchAdapter(this.$store.state.connection.elasticsearchClient)
        adapter.getClusterHealth().then(
          body => {
            this.clusterHealth = flattenObject(body, true, true)
            this.loading = false
          },
          error => this.$store.commit('setErrorState', error)
        )
      }
    }
  }
</script>
