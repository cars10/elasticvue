<template>
  <v-card>
    <v-card-title>
      <h2 class="headline">Node Information</h2>
      <reload-button :action="() => $refs.dataLoader.loadData()"></reload-button>
    </v-card-title>
    <v-divider></v-divider>

    <data-loader method="clientInfo" flatten ref="dataLoader">
      <template slot-scope="data">
        <v-list dense>
          <v-list-tile class="list__tile--selectable" v-for="key in Object.keys(data.body)" :key="key">
            <v-list-tile-content>{{key}}</v-list-tile-content>
            <v-list-tile-content class="align-end">{{data.body[key]}}
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </template>
    </data-loader>
  </v-card>
</template>

<script>
  export default {
    name: 'ClientInformation'
  }
</script>
