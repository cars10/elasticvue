<template>
  <div class="flex justify-end q-pa-md">
    <filter-input v-model="filter" />
  </div>

  <q-table class="table-mono table-hide-overflow"
           flat
           dense
           row-key="name"
           :columns="columns"
           :rows="items"
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
  import { computed, ref } from 'vue'
  import ElasticsearchNode from '../../models/ElasticsearchNode.js'
  import NodeIcons from './NodeIcons.vue'
  import NodePercentProgress from './NodePercentProgress.vue'
  import { DEFAULT_ROWS_PER_PAGE } from '../../consts'
  import { useTranslation } from '../../composables/i18n'
  import { nodeRoleTitle } from '../../helpers/nodes'
  import { filterItems } from '../../helpers/filters'
  import FilterInput from '../shared/FilterInput.vue'
  import { genColumns } from '../../helpers/tableColumns'
  import { EsNode } from '../../types/types.ts'
  import NodeAttributes from './NodeAttributes.vue'

  const t = useTranslation()

  const props = defineProps<{ nodes: EsNode[] }>()

  const filter = ref('')
  const items = computed(() => {
    const results = filterItems<EsNode>(props.nodes, filter.value, ['name', 'ip', 'id', 'version'])
    return results.map(r => new ElasticsearchNode(r))
  })

  const columns = genColumns([
    { label: t('cluster_nodes.node_properties.status'), field: '', align: 'left' },
    { label: t('cluster_nodes.node_properties.name'), field: 'name', align: 'left' },
    { label: t('cluster_nodes.node_properties.version'), field: 'version', align: 'left' },
    { label: t('cluster_nodes.node_properties.id'), field: 'id', align: 'left' },
    { label: t('cluster_nodes.node_properties.ip'), field: 'ip', align: 'left' },
    { label: t('cluster_nodes.node_properties.master'), field: 'master', align: 'left' },
    { label: t('cluster_nodes.node_properties.node_role'), field: 'nodeRole', align: 'left' },
    { label: t('cluster_nodes.node_properties.attr'), align: 'left' },
    { label: t('cluster_nodes.node_properties.load'), align: 'left' },
    { label: t('cluster_nodes.node_properties.cpu'), field: 'cpu', align: 'left' },
    { label: t('cluster_nodes.node_properties.ram'), field: 'ramPercent', align: 'left' },
    { label: t('cluster_nodes.node_properties.heap'), field: 'heapPercent', align: 'left' },
    { label: t('cluster_nodes.node_properties.disk'), field: 'diskPercent', align: 'left' }
  ])
</script>
