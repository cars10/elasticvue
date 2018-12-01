<template>
  <div>
    <v-btn-toggle v-model="listType" mandatory class="mb-4">
      <v-btn id="nodes_list_grid" flat value="grid" @click="() => this.$emit('reloadNodes')">
        <span>Grid</span>
        <v-icon>dashboard</v-icon>
      </v-btn>
      <v-btn id="nodes_list_table" flat value="table" @click="() => this.$emit('reloadNodes')">
        <span>Table</span>
        <v-icon>table_chart</v-icon>
      </v-btn>
    </v-btn-toggle>

    <nodes-grid v-if="renderGrid" :items="items" :loading="loading" @reloadNodes="() => this.$emit('reloadNodes')"/>
    <nodes-table v-else :items="items" :loading="loading" @reloadNodes="() => this.$emit('reloadNodes')"/>
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
