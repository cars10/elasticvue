<template>
  <div class="flex justify-between q-pa-md">
    <filter-state v-model="nodesStore.filter"
                  :results-count="filterStateProps.resultsCount"
                  :filtered-results-count="filterStateProps.filteredResultsCount" />
    <filter-input v-model="nodesStore.filter" class="q-ml-auto" :columns="['name', 'ip', 'id', 'version']" />
  </div>

  <q-table class="table-mono table-hide-overflow"
           flat
           dense
           row-key="name"
           :columns="columns"
           :rows="filteredResults"
           data-testid="nodes-table"
           :rows-per-page-options="DEFAULT_ROWS_PER_PAGE"
           :pagination="{sortBy: 'name'}">
    <template #body="{row}: {row: ElasticsearchNode}">
      <tr>
        <td>
          <node-icons :elasticsearch-node="row" />
        </td>
        <td>{{ row.name }}</td>
        <td>{{ row.version }}</td>
        <td>{{ row.id }}</td>
        <td>{{ row.ip }}</td>
        <td>
          <span v-if="row.master">yes</span>
          <span v-else-if="row.masterEligible">eligible</span>
          <span v-else>no</span>
        </td>
        <td :title="nodeRoleTitle(row.nodeRole)">
          {{ row.nodeRole }}
        </td>
        <td v-if="showNodeShards" class="text-right">{{ row.shards }}</td>
        <td>
          <node-attributes v-if="row.attributes" :attributes="row.attributes" />
        </td>
        <td>
          <span v-if="row.load_1m">{{ row.load_1m }} / {{ row.load_5m }} / {{ row.load_15m }}</span>
        </td>
        <td>
          <div v-if="!isNaN(row.cpu)">
            {{ row.cpu }}%
            <node-percent-progress :value="row.cpu" class="q-mt-xs" />
          </div>
        </td>
        <td>
          <div class="flex justify-between">
            <small>{{ row.ramPercent }}%</small>
            <small>{{ row.ramCurrent }}/{{ row.ramMax }}</small>
          </div>
          <node-percent-progress :value="row.ramPercent" class="q-mt-xs" />
        </td>
        <td>
          <div class="flex justify-between">
            <small>{{ row.heapPercent }}%</small>
            <small>{{ row.heapCurrent }}/{{ row.heapMax }}</small>
          </div>
          <node-percent-progress :value="row.heapPercent" class="q-mt-xs" />
        </td>
        <td>
          <template v-if="row.diskPercent">
            <div class="flex justify-between">
              <small>{{ row.diskPercent }}%</small>
              <small>{{ row.diskCurrent }}/{{ row.diskMax }}</small>
            </div>
            <node-percent-progress :value="row.diskPercent" class="q-mt-xs" />
          </template>
        </td>
      </tr>
    </template>
  </q-table>
</template>

<script setup lang="ts">
  import ElasticsearchNode from '../../models/ElasticsearchNode.js'
  import NodeIcons from './NodeIcons.vue'
  import NodePercentProgress from './NodePercentProgress.vue'
  import { DEFAULT_ROWS_PER_PAGE } from '../../consts'
  import { nodeRoleTitle } from '../../helpers/nodes'
  import FilterInput from '../shared/FilterInput.vue'
  import NodeAttributes from './NodeAttributes.vue'
  import FilterState from '../shared/FilterState.vue'
  import { useNodesStore } from '../../store/nodes.ts'
  import { NodesTableProps, useNodesTable } from '../../composables/components/nodes/NodesTable.ts'

  const nodesStore = useNodesStore()

  const props = defineProps<NodesTableProps>()
  const { filteredResults, filterStateProps, columns, showNodeShards } = useNodesTable(props)
</script>
