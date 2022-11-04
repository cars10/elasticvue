<template>
  <v-card>
    <v-card-title>
      <h2 class="text-h5">{{ $t('snapshots.heading') }}</h2>
      <reload-button :action="reloadData"/>
    </v-card-title>
    <v-divider/>

    <snapshots-table-wrapper ref="tableWrapper"/>

    <v-card-text>
      <div class="d-inline-flex">
        <path-repo-info/>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
  import ReloadButton from '@/components/shared/ReloadButton'
  import SnapshotsTableWrapper from '@/components/Snapshots/SnapshotsTableWrapper'
  import PathRepoInfo from '@/components/shared/PathRepoInfo'
  import { ref } from 'vue'

  export default {
    name: 'snapshots',
    components: {
      ReloadButton,
      SnapshotsTableWrapper,
      PathRepoInfo
    },
    setup () {
      const tableWrapper = ref(null)
      const reloadData = () => {
        tableWrapper.value.loadSnapshots()
      }

      return {
        tableWrapper,
        reloadData
      }
    }
  }
</script>
