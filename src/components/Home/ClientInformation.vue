<template>
  <v-card>
    <v-card-title>
      <h2 class="headline">Node Information</h2>
      <reload-button :action="() => $refs.dataLoader.loadData()"/>
    </v-card-title>
    <v-divider/>

    <data-loader ref="dataLoader" method="clientInfo" flatten>
      <template v-slot:default="data">
        <v-list dense>
          <v-list-tile v-for="key in Object.keys(data.body)" :key="key">
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
