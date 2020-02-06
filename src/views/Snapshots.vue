<template>
  <v-card>
    <v-card-title>
      <h2 class="headline">Snapshots</h2>
      <reload-button :action="reloadData"/>
    </v-card-title>
    <v-divider/>

    <snapshots-table-wrapper ref="tableWrapper"/>
  </v-card>
</template>

<script>
  import ReloadButton from '@/components/shared/ReloadButton'
  import SnapshotsTableWrapper from '@/components/Snapshots/SnapshotsTableWrapper'

  export default {
    name: 'snapshots',
    components: {
      ReloadButton,
      SnapshotsTableWrapper
    },
    methods: {
      reloadData () {
        this.$refs.tableWrapper.reloadData()
      }
    }
  }
</script>
