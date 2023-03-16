<template>
  <div class="flex justify-end q-pa-md">
    <div class="flex">
      <q-input v-model="filter" :label="t('defaults.filter.label')" dense @keyup.esc="filter = ''">
        <template #append>
          <q-icon name="search" />
        </template>
      </q-input>
    </div>
  </div>

  <q-table flat
           dense
           row-key="name"
           :columns="columns"
           :rows="items"
           :rows-per-page-options="DEFAULT_ROWS_PER_PAGE"
           :pagination="{sortBy: 'name'}">
    <template #body="{row}">
      <q-tr>
        <q-td>
          <node-icons :elasticsearch-node="row" />
        </q-td>
        <q-td>{{ row.name }}</q-td>
        <q-td>{{ row.ip }}</q-td>
        <q-td>
          <span v-if="row.master">yes</span>
          <span v-else-if="row.masterEligible">eligible</span>
          <span v-else>no</span>
        </q-td>
        <q-td :title="nodeRoleTitle(row.nodeRole)">
          {{ row.nodeRole }}
        </q-td>
        <q-td>{{ row.load_1m }} / {{ row.load_5m }} / {{ row.load_15m }}</q-td>
        <q-td>
          {{ row.cpu }}%
          <node-percent-progress :value="row.cpu" class="q-mt-xs" />
        </q-td>
        <q-td>
          <div class="flex justify-between">
            <small>{{ row.ramPercent }}%</small>
            <small>{{ row.ramCurrent }}/{{ row.ramMax }}</small>
          </div>
          <node-percent-progress :value="row.ramPercent" class="q-mt-xs" />
        </q-td>
        <q-td>
          <div class="flex justify-between">
            <small>{{ row.heapPercent }}%</small>
            <small>{{ row.heapCurrent }}/{{ row.heapMax }}</small>
          </div>
          <node-percent-progress :value="row.heapPercent" class="q-mt-xs" />
        </q-td>
        <q-td>
          <div class="flex justify-between">
            <small>{{ row.diskPercent }}%</small>
            <small>{{ row.diskCurrent }}/{{ row.diskMax }}</small>
          </div>
          <node-percent-progress :value="row.diskPercent" class="q-mt-xs" />
        </q-td>
      </q-tr>
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
