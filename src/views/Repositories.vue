<template>
  <v-card>
    <v-card-title>
      <h2 class="text-h5">Repositories</h2>
      <reload-button id="reload-snapshot-repositories" :action="load"/>
    </v-card-title>
    <v-divider/>

    <loader :request-state="requestState">
      <repositories-table :loading="requestState.loading"
                          :repositories="data || {}"
                          @reloadData="load"/>
    </loader>

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
  import ReloadButton from '@/components/shared/ReloadButton'
  import RepositoriesTable from '@/components/Repositories/RepositoriesTable'
  import Loader from '@/components/shared/Loader'
  import { setupElasticsearchRequest } from '@/mixins/RequestComposition'
  import { onMounted } from '@vue/composition-api'

  export default {
    name: 'repositories',
    components: {
      Loader,
      ReloadButton,
      RepositoriesTable
    },
    setup () {
      const { load, requestState, data } = setupElasticsearchRequest('catRepositories')
      onMounted(load)

      return {
        load,
        requestState,
        data
      }
    }
  }
</script>
