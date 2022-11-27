<template>
  <v-card>
    <v-card-title>
      <h2 class="text-h5">{{ $t('snapshots.heading', { name: 'dirk' }) }}</h2>
      <reload-button :action="load"/>
    </v-card-title>
    <v-divider/>

    <loader :request-state="requestState" hide-progress>
      <snapshots-table :snapshots="data || []"
                       :loading="requestState.loading"
                       :repository="repository"
                       @reloadData="load"/>
    </loader>
  </v-card>
</template>

<script>
  import ReloadButton from '@/components/shared/ReloadButton'
  import Loader from '@/components/shared/Loader'
  import SnapshotsTable from '@/components/Snapshots/SnapshotsTable'
  import { setupElasticsearchRequest } from '@/mixins/RequestComposition'
  import { useRouter } from '@/helpers/composition'
  import { onMounted } from 'vue'

  export default {
    name: 'snapshots',
    components: {
      ReloadButton,
      SnapshotsTable,
      Loader
    },
    setup () {
      const { route } = useRouter()

      const repository = route.params.repositoryName
      const {
        load,
        requestState,
        data
      } = setupElasticsearchRequest('catSnapshots', { repository })
      onMounted(load)

      return {
        requestState,
        load,
        data,
        repository
      }
    }
  }
</script>
