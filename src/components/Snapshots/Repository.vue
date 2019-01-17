<template>
  <data-loader ref="dataLoader" :method-params="{repository}" method="catSnapshots" render-content-while-loading>
    <template slot-scope="data">
      <snapshots-table :snapshots="data.body || []"
                       :loading="data.loading"
                       :repository="repository"
                       @reloadData="reloadData"/>
    </template>
  </data-loader>
</template>

<script>
  import SnapshotsTable from '@/components/Snapshots/SnapshotsTable'

  export default {
    name: 'Repository',
    components: {
      SnapshotsTable
    },
    props: {
      repository: {
        default: '',
        type: String
      }
    },
    methods: {
      reloadData () {
        this.$refs.dataLoader.loadData()
      }
    }
  }
</script>
