<template>
  <v-card>
    <v-card-title>
      <h2 class="headline">Snapshot repositories</h2>
      <reload-button id="reload-snapshot-repositories" :action="reloadData"/>
    </v-card-title>
    <v-divider/>

    <data-loader ref="dataLoader" method="catRepositories" render-content-while-loading>
      <template v-slot:default="data">
        <repositories-table :loading="data.loading"
                            :repositories="data.body || {}"
                            @reloadData="reloadData"/>
      </template>
    </data-loader>

    <v-card-text>
      <div class="d-inline-flex">
        <v-alert :value="true" type="info">
          Note that you have to set <strong>path.repo</strong> in your <strong>elasticsearch.yml</strong> for snapshots
          to work.
          <a href="https://www.elastic.co/guide/en/elasticsearch/reference/current/modules-snapshots.html"
             rel="nofollow" target="_blank">Docs</a>
        </v-alert>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
  import DataLoader from '@/components/shared/DataLoader'
  import ReloadButton from '@/components/shared/ReloadButton'
  import RepositoriesTable from '@/components/Snapshots/RepositoriesTable'

  export default {
    name: 'snapshots',
    components: {
      DataLoader,
      ReloadButton,
      RepositoriesTable
    },
    methods: {
      reloadData () {
        this.$refs.dataLoader.loadData()
      }
    }
  }
</script>
