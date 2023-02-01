<template>
  <v-card>
    <v-card-title>
      <h2 class="text-h5">{{ $t('repositories.heading') }}</h2>
      <reload-button id="reload-snapshot-repositories" :action="load"/>
    </v-card-title>
    <v-divider/>

    <loader :request-state="requestState" hide-progress>
      <repositories-table :loading="requestState.loading" :repositories="data || {}" @reloadData="load"/>
    </loader>

    <v-card-text>
      <div class="d-inline-flex">
        <path-repo-info/>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
  import ReloadButton from '@/components/shared/ReloadButton'
  import RepositoriesTable from '@/components/Repositories/RepositoriesTable'
  import Loader from '@/components/shared/Loader'
  import { setupElasticsearchRequest } from '@/mixins/RequestComposition'
  import { onMounted } from 'vue'
  import PathRepoInfo from '@/components/shared/PathRepoInfo'

  export default {
    name: 'repositories',
    components: {
      Loader,
      ReloadButton,
      RepositoriesTable,
      PathRepoInfo
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
