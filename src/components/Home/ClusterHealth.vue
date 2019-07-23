<template>
  <v-card>
    <v-card-title>
      <h2 class="headline">Cluster Health</h2>
      <reload-button :action="() => $refs.dataLoader.loadData()"/>
    </v-card-title>
    <v-divider/>

    <data-loader ref="dataLoader" method="clusterHealth">
      <template v-slot:default="data">
        <v-list class="text--small" dense>
          <v-list-item v-for="key in Object.keys(data.body)" :key="key">
            <v-list-item-content>{{key}}</v-list-item-content>
            <v-list-item-content>
              <span class="text-right">{{data.body[key]}}</span>
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
