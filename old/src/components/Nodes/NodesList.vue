<template>
  <div>
    <v-card class="mb-4">
      <v-card-title class="clearfix">
        <v-row>
          <v-col cols="12" sm="6">
            {{ $t('nodes.nodes_list.heading') }}
            <reload-button id="reload-nodes" :action="() => $emit('reloadNodes')"/>
          </v-col>
          <v-col cols="12" sm="6">
            <div class="float-right">
              <v-text-field id="nodes_filter"
                            v-model="filter"
                            :label="$t('defaults.filter.label')"
                            append-icon="mdi-magnify"
                            autofocus
                            class="mt-0 pt-0 v-text-field--small"
                            hide-details
                            name="filter"
                            @keyup.esc="filter = ''"/>
            </div>
          </v-col>
        </v-row>
      </v-card-title>
    </v-card>

    <v-btn-toggle v-model="listType" class="mb-4 v-btn-toggle--small" mandatory>
      <v-btn id="nodes_list_grid" text value="grid" @click="$emit('reloadNodes')">
        <span>{{ $t('nodes.nodes_list.types.grid') }}</span>
        <v-icon small>mdi-view-dashboard</v-icon>
      </v-btn>
      <v-btn id="nodes_list_table" text value="table" @click="$emit('reloadNodes')">
        <span>{{ $t('nodes.nodes_list.types.table') }}</span>
        <v-icon small>mdi-table</v-icon>
      </v-btn>
    </v-btn-toggle>

    <nodes-grid v-if="renderGrid" :items="items" :loading="loading"/>
    <nodes-table v-else :items="items" :loading="loading"/>
  </div>
</template>

<script>
  import NodesGrid from '@/components/Nodes/NodesGrid'
  import NodesTable from '@/components/Nodes/NodesTable'
  import ReloadButton from '@/components/shared/ReloadButton'
  import store from '@/store'
  import { computed } from 'vue'
  import { vuexAccessors } from '@/helpers/store'
  import ElasticsearchNode from '@/models/ElasticsearchNode'
  import { filterItems } from '@/helpers/filters'

  export default {
    name: 'nodes-list',
    components: {
      NodesGrid,
      NodesTable,
      ReloadButton
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
      const { listType, filter } = vuexAccessors('nodes', ['listType', 'filter'])

      const renderGrid = computed(() => {
        return store.state.nodes.listType === 'grid'
      })

      const items = computed(() => {
        const results = filterItems(props.nodes, filter.value, ['name', 'ip'])
        return results.map(r => new ElasticsearchNode(r))
      })

      return {
        listType,
        renderGrid,
        items,
        filter
      }
    }
  }
</script>
