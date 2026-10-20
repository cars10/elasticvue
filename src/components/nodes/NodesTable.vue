<template>
  <div class="flex justify-between q-my-md">
    <filter-state
      v-model="nodesStore.filter"
      :results-count="filterStateProps.resultsCount"
      :filtered-results-count="filterStateProps.filteredResultsCount"
    />

    <div class="flex items-center q-ml-auto">
      <slot />
      <filter-input v-model="nodesStore.filter" class="q-ml-md" :columns="['name', 'ip', 'id', 'version']" />
    </div>
  </div>

  <q-card>
    <q-table
      class="table-mono table-hide-overflow"
      flat
      :loading="loading && nodes.length === 0"
      row-key="id"
      :columns="columns"
      :rows="filteredResults"
      data-testid="nodes-table"
      :rows-per-page-options="DEFAULT_ROWS_PER_PAGE"
      v-model:pagination="nodesStore.pagination"
    >
      <template #body="{ row }: { row: NodeRow }">
        <tr :key="row.id">
          <td>
            <div class="text-weight-medium">{{ row.name }}</div>
            <div class="text-muted font-13">{{ row.ip }}</div>
            <div class="text-muted font-13">{{ row.id }}</div>
          </td>
          <td>
            <node-roles :roles="row.roles" :master="row.master" />
          </td>
          <td>{{ row.version }}</td>
          <td v-if="showNodeShards" class="text-right">{{ row.shards ?? '—' }}</td>
          <td class="text-right">{{ formatCount(row.docs) }}</td>
          <td class="text-right">{{ row.storeBytes == null ? '—' : prettyPrintByteString(row.storeBytes) }}</td>
          <td class="text-right" :class="{ 'health--yellow': row.uptimeMs != null && row.uptimeMs < RECENT_RESTART_MS }">
            {{ formatUptime(row.uptimeMs) }}
          </td>
          <td>
            <node-attributes :attributes="row.attributes" />
          </td>
          <td class="metric-cell">
            <metric-bar :value="row.cpuPercent" :thresholds="CPU_THRESHOLDS" />
          </td>
          <td class="metric-cell">
            <metric-bar
              :value="row.heapPercent"
              :thresholds="HEAP_THRESHOLDS"
              :detail="bytesDetail(row.heapUsedBytes, row.heapMaxBytes)"
            />
          </td>
          <td class="metric-cell">
            <metric-bar
              :value="row.diskPercent"
              :thresholds="diskThresholds(diskWatermarks)"
              :detail="bytesDetail(row.diskUsedBytes, row.diskTotalBytes)"
            />
          </td>
        </tr>
      </template>
    </q-table>
  </q-card>
</template>

<script setup lang="ts">
import { DEFAULT_ROWS_PER_PAGE } from '../../consts'
import { formatCount, formatUptime, RECENT_RESTART_MS } from '../../helpers/nodes'
import { prettyPrintByteString } from '../../helpers/bytes.ts'
import { CPU_THRESHOLDS, diskThresholds, HEAP_THRESHOLDS } from '../../helpers/pressure.ts'
import FilterInput from '../shared/FilterInput.vue'
import FilterState from '../shared/FilterState.vue'
import MetricBar from '../shared/MetricBar.vue'
import NodeAttributes from './NodeAttributes.vue'
import NodeRoles from './NodeRoles.vue'
import { useNodesStore } from '../../store/nodes.ts'
import { NodesTableProps, useNodesTable } from '../../composables/components/nodes/NodesTable.ts'
import type { DiskWatermarks } from '../../types/homeDashboard.ts'
import type { NodeRow } from '../../types/nodes.ts'

const nodesStore = useNodesStore()

const props = defineProps<NodesTableProps & { diskWatermarks: DiskWatermarks }>()
const { filteredResults, filterStateProps, columns, showNodeShards } = useNodesTable(props)

const bytesDetail = (used: number | null, total: number | null) => {
  if (used == null || total == null) return null
  return `${prettyPrintByteString(used)} / ${prettyPrintByteString(total)}`
}
</script>

<style scoped>
.metric-cell {
  min-width: 140px;
}
</style>
