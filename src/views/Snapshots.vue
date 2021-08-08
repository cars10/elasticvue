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

  export default {
    name: 'snapshots',
    components: {
      ReloadButton,
      SnapshotsTableWrapper,
      PathRepoInfo
    },
    setup (props, context) {
      const reloadData = () => {
        context.refs.tableWrapper.loadSnapshots()
      }

      return {
        reloadData
      }
    }
  }
</script>
