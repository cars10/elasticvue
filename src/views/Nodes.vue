<template>
  <data-loader ref="dataLoader" :method-params="CAT_METHOD_PARAMS" method="catNodes" render-content-while-loading>
    <template v-slot:default="data">
      <nodes-list :loading="data.loading" :nodes="data.body || []" @reloadNodes="reloadNodes"/>
    </template>
  </data-loader>
</template>

<script>
  import DataLoader from '@/components/shared/DataLoader'
  import NodesList from '@/components/Nodes/NodesList'

  export default {
    name: 'nodes',
    components: {
      DataLoader,
      NodesList
    },
    created () {
      this.CAT_METHOD_PARAMS = {
        h: [
          'ip',
          'name',
          'heap.percent',
          'heap.current',
          'heap.max',
          'ram.percent',
          'ram.current',
          'ram.max',
          'node.role',
          'master',
          'cpu',
          'load_1m',
          'load_5m',
          'load_15m',
          'disk.used_percent',
          'disk.used',
          'disk.total'
        ]
      }
    },
    methods: {
      reloadNodes () {
        this.$refs.dataLoader.loadData()
      }
    }
  }
</script>
