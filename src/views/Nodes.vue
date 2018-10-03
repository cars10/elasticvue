<template>
  <div>
    <data-loader ref="dataLoader" method="catNodes" render-content-while-loading>
      <template slot-scope="data">
        <nodes-list :nodes="data.body || []" :loading="data.loading" @reloadNodes="reloadNodes"/>
      </template>
    </data-loader>
  </div>
</template>

<script>
  import NodesList from '@/components/Nodes/NodesList'

  export default {
    name: 'nodes',
    components: {
      NodesList
    },
    methods: {
      reloadNodes () {
        this.$refs.dataLoader.loadData()
      }
    }
  }
</script>
