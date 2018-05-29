<template>
  <v-card>
    <v-card-title>
      <h2 class="headline">Cluster Health</h2>
      <reload-button :action="() => $refs.dataLoader.loadData()"></reload-button>
    </v-card-title>
    <v-divider></v-divider>

    <data-loader method="clusterHealth" ref="dataLoader">
      <template slot-scope="data">
        <v-list dense>
          <v-list-tile v-for="key in Object.keys(data.body)" :key="key">
            <v-list-tile-content>{{key}}</v-list-tile-content>
            <v-list-tile-content class="align-end">
              <v-chip :class="data.body[key]" v-if="key === 'status'">{{data.body[key]}}</v-chip>
              <span v-else>{{data.body[key]}}</span>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </template>
    </data-loader>
  </v-card>
</template>

<script>
  export default {
    name: 'ClusterHealth'
  }
</script>
