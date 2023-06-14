<template>
  <div class="flex justify-end q-pa-md">
    <filter-input v-model="filter" />
  </div>

  <q-table class="table-mono"
           flat
           dense
           row-key="name"
           :columns="columns"
           :rows="items"
           :rows-per-page-options="DEFAULT_ROWS_PER_PAGE"
           :pagination="{sortBy: 'name'}">
    <template #body="{row}">
      <tr>
        <td>
          <node-icons :elasticsearch-node="row" />
        </td>
        <td>{{ row.name }}</td>
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
        <td>{{ row.load_1m }} / {{ row.load_5m }} / {{ row.load_15m }}</td>
        <td>
          {{ row.cpu }}%
          <node-percent-progress :value="row.cpu" class="q-mt-xs" />
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
          <div class="flex justify-between">
            <small>{{ row.diskPercent }}%</small>
            <small>{{ row.diskCurrent }}/{{ row.diskMax }}</small>
          </div>
          <node-percent-progress :value="row.diskPercent" class="q-mt-xs" />
        </td>
      </tr>
    </template>
  </q-table>
</template>

<script setup>
  import { computed, ref } from 'vue'
  import ElasticsearchNode from '../../models/ElasticsearchNode'
  import NodeIcons from './NodeIcons.vue'
  import NodePercentProgress from './NodePercentProgress.vue'
  import { DEFAULT_ROWS_PER_PAGE } from '../../consts'
  import { useTranslation } from '../../composables/i18n'
  import { nodeRoleTitle } from '../../helpers/nodes'
  import { filterItems } from '../../helpers/filters'
  import FilterInput from '../shared/FilterInput.vue'

  const t = useTranslation()

  const props = defineProps({
    nodes: {
      type: Array,
      default: () => ([])
    }
  })

  const filter = ref('')
  const items = computed(() => {
    const results = filterItems(props.nodes, filter.value, ['name', 'ip'])
    return results.map(r => new ElasticsearchNode(r))
  })

  const columns = [
    { label: t('nodes.node_properties.status'), field: '', align: 'left' },
    { label: t('nodes.node_properties.name'), field: 'name', name: 'name', sortable: true, align: 'left' },
    { label: t('nodes.node_properties.id'), field: 'ip', align: 'left' },
    { label: t('nodes.node_properties.ip'), field: 'ip', sortable: true, align: 'left' },
    { label: t('nodes.node_properties.master'), field: 'master', sortable: true, align: 'left' },
    { label: t('nodes.node_properties.node_role'), field: 'nodeRole', sortable: true, align: 'left' },
    { label: t('nodes.node_properties.load'), field: 'load_1m', sortable: true, align: 'left' },
    { label: t('nodes.node_properties.cpu'), field: 'cpu', sortable: true, align: 'left' },
    { label: t('nodes.node_properties.ram'), field: 'ramPercent', sortable: true, align: 'left' },
    { label: t('nodes.node_properties.heap'), field: 'heapPercent', sortable: true, align: 'left' },
    { label: t('nodes.node_properties.disk'), field: 'diskPercent', sortable: true, align: 'left' }
  ]
</script>
