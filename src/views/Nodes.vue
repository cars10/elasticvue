<template>
  <nodes-list :loading="requestState.loading" :nodes="data || []" @reloadNodes="load"/>
</template>

<script>
  import NodesList from '@/components/Nodes/NodesList'
  import { setupElasticsearchRequest } from '@/mixins/RequestComposition'
  import { onMounted } from 'vue'

  export default {
    name: 'nodes',
    components: {
      NodesList
    },
    setup () {
      const CAT_METHOD_PARAMS = {
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

      const { load, requestState, data } = setupElasticsearchRequest('catNodes', CAT_METHOD_PARAMS)
      onMounted(load)

      return {
        load,
        requestState,
        data
      }
    }
  }
</script>
