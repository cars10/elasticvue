<template>
  <v-flex>
    <v-data-table :rows-per-page-items="defaultRowsPerPage"
                  :headers="headers"
                  :items="items"
                  :custom-filter="callFuzzyTableFilter"
                  :pagination.sync="pagination"
                  :search="filter"
                  :loading="loading">
      <template slot="items" slot-scope="props">
        <tr>
          <td>
            <node-icons :elasticsearch-node="props.item" />
          </td>
          <td>{{props.item.name}}</td>
          <td>{{props.item.ip}}</td>
          <td>
            <span v-if="props.item.master">yes</span>
            <span v-else-if="props.item.masterEligible">eligible</span>
            <span v-else>no</span>
          </td>
          <td>{{props.item.nodeRole}}</td>
          <td>
            {{props.item.ramPercent}}%
            <v-progress-linear :value="props.item.ramPercent" height="3" class="my-0"/>
          </td>
          <td>
            {{props.item.heapPercent}}%
            <v-progress-linear :value="props.item.heapPercent" height="3" class="my-0"/>
          </td>
          <td>
            {{props.item.cpu}}%
            <v-progress-linear :value="props.item.cpu" height="3" class="my-0"/>
          </td>
          <td>{{props.item.load_1m}} / {{props.item.load_5m}} / {{props.item.load_15m}}</td>
        </tr>
      </template>
    </v-data-table>
  </v-flex>
</template>

<script>
  import { mapVuexAccessors } from '../../helpers/store'
  import { DEFAULT_ROWS_PER_PAGE } from '../../consts'
  import { fuzzyTableFilter } from '../../helpers/filters'
  import NodeIcons from '@/components/Nodes/NodeIcons'

  export default {
    name: 'nodes-table',
    components: {
      NodeIcons
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
      defaultRowsPerPage () {
        return DEFAULT_ROWS_PER_PAGE
      },
      headers () {
        return [
          { text: '', value: '', sortable: false },
          { text: 'name', value: 'name' },
          { text: 'ip', value: 'ip' },
          { text: 'master', value: 'master' },
          { text: 'node.role', value: 'nodeRole' },
          { text: 'ram', value: 'ramPercent' },
          { text: 'heap', value: 'heapPercent' },
          { text: 'cpu', value: 'cpu' },
          { text: 'load', value: 'load_1m' }
        ]
      }
    },
    methods: {
      callFuzzyTableFilter (items, search, filter, headers) {
        return fuzzyTableFilter(items, search, headers)
      }
    }
  }
</script>
