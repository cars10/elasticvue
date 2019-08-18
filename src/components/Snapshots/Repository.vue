<template>
  <data-loader ref="dataLoader" :method-params="{repository}" method="catSnapshots" render-content-while-loading>
    <template v-slot:default="data">
      <snapshots-table :loading="data.loading"
                       :repository="repository"
                       :snapshots="data.body || []"
                       @reloadData="reloadData"/>
    </template>
  </data-loader>
</template>

<script>
  import DataLoader from '@/components/shared/DataLoader'
  import SnapshotsTable from '@/components/Snapshots/SnapshotsTable'

  export default {
    name: 'repository',
    components: {
      DataLoader,
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
