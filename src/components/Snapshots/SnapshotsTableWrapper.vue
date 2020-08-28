<template>
  <div>
    <v-card-text>
      <v-row>
        <v-col>
          <new-snapshot :repository="repository" @reloadData="loadSnapshots"/>
        </v-col>
        <v-col>
          <div class="float-right d-inline-flex">
            <v-select :items="repositories ? Object.keys(repositories) : [repository]"
                      v-model="repository"
                      :loading="repositoriesRequestState.loading"
                      :background-color="repository ? '' : 'orange'"
                      hide-details
                      label="Repository"
                      class="pr-4 pt-0 mt-0"
                      name="repository"/>
            <v-text-field id="filter"
                          v-model="filter"
                          append-icon="mdi-magnify"
                          autofocus
                          class="mt-0 pt-0 v-text-field--small"
                          hide-details
                          label="Filter..."
                          name="filter"
                          title="Filter via 'column:query'"
                          @keyup.esc="filter = ''"/>
          </div>
        </v-col>
      </v-row>
    </v-card-text>

    <loader v-if="repository" :request-state="requestState">
      <snapshots-table :loading="requestState.loading" :snapshots="snapshots || []" :filter="filter"
                       :repository="repository" @reloadData="loadSnapshots"/>
    </loader>
    <div v-else class="text-center">
      <v-alert color="grey" class="d-inline-block">Please select a repository first.</v-alert>
    </div>
  </div>
</template>

<script>
  import NewSnapshot from '@/components/Snapshots/NewSnapshot'
  import SnapshotsTable from '@/components/Snapshots/SnapshotsTable'
  import { compositionVuexAccessors } from '@/helpers/store'
  import { setupElasticsearchRequest, useElasticsearchRequest } from '@/mixins/RequestComposition'
  import { onMounted, ref, watch } from '@vue/composition-api'
  import Loader from '@/components/shared/Loader'

  export default {
    name: 'snapshots-table-wrapper',
    components: {
      Loader,
      NewSnapshot,
      SnapshotsTable
    },
    setup () {
      const { filter, repository } = compositionVuexAccessors('snapshots', ['filter', 'repository'])
      const { requestState, callElasticsearch } = useElasticsearchRequest()
      const { load: loadRepositories, requestState: repositoriesRequestState, data: repositories } = setupElasticsearchRequest('catRepositories')

      onMounted(() => {
        if (repository.value) loadSnapshots()
        loadRepositories()
      })

      const snapshots = ref(null)
      const loadSnapshots = () => {
        callElasticsearch('catSnapshots', { repository: repository.value })
          .then(b => (snapshots.value = b))
      }

      watch(repository, loadSnapshots)

      return {
        loadSnapshots,
        requestState,
        snapshots,
        filter,
        repository,
        repositoriesRequestState,
        repositories
      }
    }
  }
</script>
