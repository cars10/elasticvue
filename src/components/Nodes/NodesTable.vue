<template>
  <v-card>
    <v-card-title class="clearfix">
      <v-row>
        <v-col class="py-0" cols="12" sm="6">
          Nodes
          <reload-button id="reload-nodes" :action="() => this.$emit('reloadNodes')"/>
        </v-col>
        <v-col class="py-0" cols="12" sm="6">
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

            <settings-dropdown>
              <single-setting v-model="stickyTableHeader" name="Sticky table header"/>
            </settings-dropdown>
          </div>
        </v-col>
      </v-row>
    </v-card-title>
    <v-divider/>

    <v-data-table :class="tableClasses"
                  :custom-filter="callFuzzyTableFilter"
                  :footer-props="{itemsPerPageOptions: DEFAULT_ITEMS_PER_PAGE}"
                  :headers="HEADERS"
                  :items="items"
                  :loading="loading"
                  :options.sync="pagination"
                  :search="filter">
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
            <small>{{props.item.cpu}}%</small>
            <v-progress-linear :value="props.item.cpu" class="mt-1 mb-0" height="3"/>
          </td>
          <td>
            <v-row>
              <v-col class="pb-0">
                <small>{{props.item.ramCurrent}}/{{props.item.ramMax}}</small>
              </v-col>
              <v-col class="text-right pb-0">
                <small>{{props.item.ramPercent}}%</small>
              </v-col>
            </v-row>
            <node-percent-bar :value="props.item.ramPercent" classes="mt-1 mb-0"/>
          </td>
          <td>
            <v-row>
              <v-col class="pb-0">
                <small>{{props.item.heapCurrent}}/{{props.item.heapMax}}</small>
              </v-col>
              <v-col class="text-right pb-0">
                <small>{{props.item.heapPercent}}%</small>
              </v-col>
            </v-row>
            <node-percent-bar :value="props.item.heapPercent" classes="mt-1 mb-0"/>
          </td>
          <td>
            <v-row>
              <v-col class="pb-0">
                <small>{{props.item.diskCurrent}}/{{props.item.diskMax}}</small>
              </v-col>
              <v-col class="text-right pb-0">
                <small>{{props.item.diskPercent}}%</small>
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
