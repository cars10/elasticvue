<template>
  <v-card>
    <v-card-title>
      <h2 class="headline">Snapshot repositories</h2>
      <reload-button id="reload-snapshot-repositories" :action="reloadData"/>
    </v-card-title>
    <v-divider/>

    <data-loader ref="dataLoader" method="catRepositories" render-content-while-loading>
      <template v-slot:default="data">
        <repositories-table :repositories="data.body || {}"
                            :loading="data.loading"
                            @reloadData="reloadData"/>
      </template>
    </data-loader>

    <v-card-text>
      <v-flex d-inline-flex>
        <v-alert :value="true" type="info">
          Note that you have to set <strong>path.repo</strong> in your <strong>elasticsearch.yml</strong> for snapshots to work.
          <a href="https://www.elastic.co/guide/en/elasticsearch/reference/current/modules-snapshots.html" target="_blank" rel="nofollow">Docs</a>
        </v-alert>
      </v-flex>
    </v-card-text>
  </v-card>
</template>

<script>
  import ReloadButton from '@/components/shared/ReloadButton'
  import RepositoriesTable from '@/components/Snapshots/RepositoriesTable'

  export default {
    name: 'snapshots',
    components: {
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
