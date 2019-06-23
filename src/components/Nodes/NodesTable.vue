<template>
  <v-card>
    <v-card-title class="clearfix">
      <v-layout row wrap>
        <v-flex xs12 sm6 py-0 pl-0>
          <h2 class="headline d-inline-flex vertical-align--middle">Nodes</h2>
          <reload-button id="reload-nodes" :action="() => this.$emit('reloadNodes')"/>
        </v-flex>
        <v-flex xs12 sm6 py-0>
          <v-flex right d-inline-flex>
            <v-text-field id="nodes_table_filter"
                          v-model="filter"
                          append-icon="mdi-magnify"
                          label="Filter..."
                          name="filter"
                          class="mt-0 pt-0"
                          title="Filter via 'column:query'"
                          autofocus
                          hide-details
                          @keyup.esc="filter = ''"/>

            <settings-dropdown>
              <single-setting v-model="stickyTableHeader" name="Sticky table header"/>
            </settings-dropdown>
          </v-flex>
        </v-flex>
      </v-layout>
    </v-card-title>
    <v-divider/>

    <v-data-table :footer-props="{itemsPerPageOptions: DEFAULT_ITEMS_PER_PAGE}"
                  :headers="HEADERS"
                  :items="items"
                  :custom-filter="callFuzzyTableFilter"
                  :options.sync="pagination"
                  :search="filter"
                  :loading="loading"
                  :class="tableClasses">
      <template v-slot:item="props">
        <tr>
          <td>
            <node-icons :elasticsearch-node="props.item"/>
          </td>
          <td>{{props.item.name}}</td>
          <td>{{props.item.ip}}</td>
          <td>
            <span v-if="props.item.master">yes</span>
            <span v-else-if="props.item.masterEligible">eligible</span>
            <span v-else>no</span>
          </td>
          <td>{{props.item.nodeRole}}</td>
          <td>{{props.item.load_1m}} / {{props.item.load_5m}} / {{props.item.load_15m}}</td>
          <td>
            {{props.item.cpu}}%
            <v-progress-linear :value="props.item.cpu" height="3" class="mt-1 mb-0"/>
          </td>
          <td>
            <v-flex d-inline-flex>
              <small>{{props.item.ramCurrent}}/{{props.item.ramMax}}</small>
            </v-flex>
            <v-flex d-inline-flex right>{{props.item.ramPercent}}%</v-flex>
            <node-percent-bar :value="props.item.ramPercent" classes="mt-1 mb-0"/>
          </td>
          <td>
            <v-flex d-inline-flex>
              <small>{{props.item.heapCurrent}}/{{props.item.heapMax}}</small>
            </v-flex>
            <v-flex d-inline-flex right>{{props.item.heapPercent}}%</v-flex>
            <node-percent-bar :value="props.item.heapPercent" classes="mt-1 mb-0"/>
          </td>
          <td>
            <v-flex d-inline-flex>
              <small>{{props.item.diskCurrent}}/{{props.item.diskMax}}</small>
            </v-flex>
            <v-flex d-inline-flex right>{{props.item.diskPercent}}%</v-flex>
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
  import SettingsDropdown from '@/components/shared/TableSettings/SettingsDropdown'
  import SingleSetting from '@/components/shared/TableSettings/SingleSetting'
  import { mapVuexAccessors } from '../../helpers/store'
  import { DEFAULT_ITEMS_PER_PAGE } from '../../consts'
  import { fuzzyTableFilter } from '../../helpers/filters'
  import { fixedTableHeaderOnDisable, fixedTableHeaderOnEnable, resetTableHeight } from '@/mixins/FixedTableHeader'

  export default {
    name: 'nodes-table',
    components: {
      NodeIcons,
      NodePercentBar,
      ReloadButton,
      SettingsDropdown,
      SingleSetting
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
    computed: {
      ...mapVuexAccessors('nodes', ['filter', 'pagination']),
      stickyTableHeader: {
        get () {
          return this.$store.state.nodes.stickyTableHeader
        },
        set (value) {
          if (!value) resetTableHeight()
          this.$store.commit('nodes/setStickyTableHeader', value)
        }
      },
      tableClasses () {
        return [
          'table--condensed',
          'nodes_table',
          { 'table--fixed-header': this.stickyTableHeader }
        ]
      }
    },
    mounted () {
      fixedTableHeaderOnEnable()
    },
    beforeDestroy () {
      fixedTableHeaderOnDisable()
    },
    created () {
      this.HEADERS = [
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

      this.DEFAULT_ITEMS_PER_PAGE = DEFAULT_ITEMS_PER_PAGE
    },
    methods: {
      callFuzzyTableFilter (items, search, filter, headers) {
        return fuzzyTableFilter(items, search, headers)
      }
    }
  }
</script>
