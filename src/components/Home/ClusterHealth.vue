<template>
  <v-card>
    <v-card-title>
      <h2 class="headline">Cluster Health</h2>
      <reload-button :action="() => $refs.dataLoader.loadData()"/>
    </v-card-title>
    <v-divider/>

    <data-loader ref="dataLoader" method="clusterHealth">
      <template slot-scope="data">
        <v-list dense>
          <v-list-tile v-for="key in Object.keys(data.body)" :key="key">
            <v-list-tile-content>{{key}}</v-list-tile-content>
            <v-list-tile-content class="align-end">
              <span>{{data.body[key]}}</span>
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
