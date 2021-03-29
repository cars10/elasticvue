<template>
  <div>
    <v-btn-toggle v-model="listType" class="mb-4 v-btn-toggle--small" mandatory>
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
  import ElasticsearchNode from '../../models/ElasticsearchNode'
  import { computed } from '@vue/composition-api'
  import store from '@/store'
  import { compositionVuexAccessors } from '@/helpers/store'

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
    setup (props) {
      const { listType } = compositionVuexAccessors('nodes', ['listType'])

      const renderGrid = computed(() => {
        return store.state.nodes.listType === 'grid'
      })

      const items = computed(() => {
        return props.nodes.map(node => new ElasticsearchNode(node))
      })

      return {
        listType,
        renderGrid,
        items
      }
    }
  }
</script>
