<template>
  <div>
    <v-btn-toggle v-model="listType" mandatory class="mb-4 v-btn-toggle--small">
      <v-btn id="nodes_list_grid" text value="grid" @click="$emit('reloadNodes')">
        <span>Grid</span>
        <v-icon small>mdi-view-dashboard</v-icon>
      </v-btn>
      <v-btn id="nodes_list_table" text value="table" @click="$emit('reloadNodes')">
        <span>Table</span>
        <v-icon small>mdi-table</v-icon>
      </v-btn>
    </v-btn-toggle>

    <nodes-grid v-if="renderGrid" :items="items" :loading="loading" @reloadNodes="$emit('reloadNodes')"/>
    <nodes-table v-else :items="items" :loading="loading" @reloadNodes="$emit('reloadNodes')"/>
  </div>
</template>

<script>
  import NodesGrid from '@/components/Nodes/NodesGrid'
  import NodesTable from '@/components/Nodes/NodesTable'
  import { mapVuexAccessors } from '../../helpers/store'
  import ElasticsearchNode from '../../models/ElasticsearchNode'

  export default {
    name: 'nodes-list',
    components: {
      NodesGrid,
      NodesTable
    },
    props: {
      nodes: {
        type: Array,
        default: () => {
          return []
        }
      },
      loading: {
        type: Boolean,
        default: true
      }
    },
    computed: {
      ...mapVuexAccessors('nodes', ['listType']),
      renderGrid () {
        return this.listType === 'grid'
      },
      items () {
        return this.nodes.map(node => new ElasticsearchNode(node))
      }
    }
  }
</script>
