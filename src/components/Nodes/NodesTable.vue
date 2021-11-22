<template>
  <v-card>
    <v-data-table :footer-props="{itemsPerPageOptions: DEFAULT_ITEMS_PER_PAGE, showFirstLastPage: true}"
                  :headers="HEADERS"
                  :items="items"
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
          <td :title="nodeRoleTitle(props.item.nodeRole)">{{ props.item.nodeRole }}</td>
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
      <template v-slot:no-data>
        <template v-if="filter">
          {{ $t('shared.nothing_found_for_filter', { filter }) }}
        </template>
        <template v-else>
          {{ $t('shared.nothing_found') }}
        </template>
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
  import NodeIcons from '@/components/Nodes/NodeIcons'
  import NodePercentBar from '@/components/Nodes/NodePercentBar'
  import { vuexAccessors } from '@/helpers/store'
  import { DEFAULT_ITEMS_PER_PAGE } from '@/consts'
  import i18n from '@/i18n'
  import { nodeRoleTitle } from '@/helpers'

  export default {
    name: 'nodes-table',
    components: {
      NodeIcons,
      NodePercentBar
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
    setup () {
      const { filter, pagination } = vuexAccessors('nodes', ['filter', 'pagination'])

      const HEADERS = [
        { text: i18n.t('nodes.node_properties.status'), value: '', sortable: false },
        { text: i18n.t('nodes.node_properties.name'), value: 'name' },
        { text: i18n.t('nodes.node_properties.ip'), value: 'ip' },
        { text: i18n.t('nodes.node_properties.master'), value: 'master' },
        { text: i18n.t('nodes.node_properties.node_role'), value: 'nodeRole' },
        { text: i18n.t('nodes.node_properties.load'), value: 'load_1m' },
        { text: i18n.t('nodes.node_properties.cpu'), value: 'cpu' },
        { text: i18n.t('nodes.node_properties.ram'), value: 'ramPercent' },
        { text: i18n.t('nodes.node_properties.heap'), value: 'heapPercent' },
        { text: i18n.t('nodes.node_properties.disk'), value: 'diskPercent' },
        { text: '', value: 'actions', sortable: false }
      ]

      return {
        nodeRoleTitle,
        filter,
        pagination,
        HEADERS,
        DEFAULT_ITEMS_PER_PAGE
      }
    }
  }
</script>
