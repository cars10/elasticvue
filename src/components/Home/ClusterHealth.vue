<template>
  <v-card>
    <v-card-title>
      <h2 class="headline">Cluster Health</h2>
      <reload-button :action="() => $refs.dataLoader.loadData()"/>
    </v-card-title>
    <v-divider/>

    <data-loader ref="dataLoader" method="clusterHealth">
      <template v-slot:default="data">
        <v-list dense class="text--small">
          <v-list-item v-for="key in Object.keys(data.body)" :key="key">
            <v-list-item-content>{{key}}</v-list-item-content>
            <v-list-item-content class="align-end pl-2">
              {{data.body[key]}}
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </template>
    </data-loader>
  </v-card>
</template>

<script>
  import DataLoader from '@/components/shared/DataLoader'
  import ReloadButton from '@/components/shared/ReloadButton'

  export default {
    name: 'cluster-health',
    components: {
      DataLoader,
      ReloadButton
    }
  }
</script>
