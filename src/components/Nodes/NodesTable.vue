<template>
  <v-card>
    <v-card-title class="clearfix">
      <v-row>
        <v-col cols="12" sm="6">
          Nodes
          <reload-button id="reload-nodes" :action="() => this.$emit('reloadNodes')"/>
        </v-col>
        <v-col cols="12" sm="6">
          <div class="float-right">
            <v-text-field id="nodes_table_filter"
                          v-model="filter"
                          append-icon="mdi-magnify"
                          autofocus
                          class="mt-0 pt-0 v-text-field--small"
                          hide-details
                          label="Filter..."
                          name="filter"
                          title="Filter via 'column:query'"
                          @keyup.esc="filter = ''"/>
          </div>
        </v-col>
      </v-row>
    </v-card-title>
    <v-divider/>

    <v-data-table :footer-props="{itemsPerPageOptions: DEFAULT_ITEMS_PER_PAGE}"
                  :headers="HEADERS"
                  :items="filteredItems"
                  :loading="loading"
                  :options.sync="pagination"
                  class="table--condensed nodes_table table--fixed-header">
      <template v-slot:item="props">
        <tr>
          <td>
            <node-icons :elasticsearch-node="props.item"/>
          </td>
          <td>{{ props.item.name }}</td>
          <td>{{ props.item.ip }}</td>
          <td>
            <span v-if="props.item.master">yes</span>
            <span v-else-if="props.item.masterEligible">eligible</span>
            <span v-else>no</span>
          </td>
          <td>{{ props.item.nodeRole }}</td>
          <td>{{ props.item.load_1m }} / {{ props.item.load_5m }} / {{ props.item.load_15m }}</td>
          <td>
            <small>{{ props.item.cpu }}%</small>
            <node-percent-bar :value="props.item.cpu" class="mt-1 mb-0"/>
          </td>
          <td>
            <v-row>
              <v-col>
                <small>{{ props.item.ramCurrent }}/{{ props.item.ramMax }}</small>
              </v-col>
              <v-col class="text-right">
                <small>{{ props.item.ramPercent }}%</small>
              </v-col>
            </v-row>
            <node-percent-bar :value="props.item.ramPercent" classes="mt-1 mb-0"/>
          </td>
          <td>
            <v-row>
              <v-col>
                <small>{{ props.item.heapCurrent }}/{{ props.item.heapMax }}</small>
              </v-col>
              <v-col class="text-right">
                <small>{{ props.item.heapPercent }}%</small>
              </v-col>
            </v-row>
            <node-percent-bar :value="props.item.heapPercent" classes="mt-1 mb-0"/>
          </td>
          <td>
            <v-row>
              <v-col>
                <small>{{ props.item.diskCurrent }}/{{ props.item.diskMax }}</small>
              </v-col>
              <v-col class="text-right">
                <small>{{ props.item.diskPercent }}%</small>
              </v-col>
            </v-row>
            <node-percent-bar :value="props.item.diskPercent" classes="mt-1 mb-0"/>
          </td>
        </tr>
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
  import NodeIcons from '@/components/Nodes/NodeIcons'
  import NodePercentBar from '@/components/Nodes/NodePercentBar'
  import ReloadButton from '@/components/shared/ReloadButton'
  import { compositionVuexAccessors } from '@/helpers/store'
  import { DEFAULT_ITEMS_PER_PAGE } from '@/consts'
  import { fuzzyTableFilter } from '@/helpers/filters'
  import { computed } from '@vue/composition-api'

  export default {
    name: 'nodes-table',
    components: {
      NodeIcons,
      NodePercentBar,
      ReloadButton
    },
    props: {
      items: {
        type: Array,
        default: () => {
          return []
        }
      },
      loading: {
        type: Boolean,
        default: false
      }
    },
    setup (props) {
      const { filter, pagination } = compositionVuexAccessors('nodes', ['filter', 'pagination'])
      const filteredItems = computed(() => {
        return fuzzyTableFilter(props.items, filter.value, [{ value: 'name' }, { value: 'ip' }])
      })

      const HEADERS = [
        { text: 'status', value: '', sortable: false },
        { text: 'name', value: 'name' },
        { text: 'ip', value: 'ip' },
        { text: 'master', value: 'master' },
        { text: 'node.role', value: 'nodeRole' },
        { text: 'load', value: 'load_1m' },
        { text: 'cpu', value: 'cpu' },
        { text: 'ram', value: 'ramPercent' },
        { text: 'heap', value: 'heapPercent' },
        { text: 'disk', value: 'diskPercent' },
        { text: '', value: 'actions', sortable: false }
      ]

      return {
        filter,
        pagination,
        filteredItems,
        HEADERS,
        DEFAULT_ITEMS_PER_PAGE
      }
    }
  }
</script>
