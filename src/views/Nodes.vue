<template>
  <div>
    <data-loader ref='dataLoader' :method-params='catMethodParams' method='catNodes' render-content-while-loading>
      <template slot-scope='data'>
        <nodes-list :nodes='data.body || []' :loading='data.loading' @reloadNodes='reloadNodes'/>
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
    data () {
      return {
        catMethodParams: {
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
      }
    },
    methods: {
      reloadNodes () {
        this.$refs.dataLoader.loadData()
      }
    }
  }
</script>
