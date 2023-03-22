<template>
  <div class="flex justify-between q-pa-md">
    <div>
      <new-index @reload="emit('reload')" />
      <router-link to="index_templates" class="q-ml-md">
        {{ $t('index_templates.heading') }}
      </router-link>
    </div>

    <div class="flex">
      <filter-input v-model="filter" />

      <q-btn icon="settings" round flat>
        <q-menu style="white-space: nowrap" anchor="bottom right" self="top end">
          <q-list dense>
            <q-item style="padding-left: 0">
              <q-checkbox v-model="indicesStore.showHiddenIndices"
                          :label="$t('indices.indices_table.show_hidden_indices.label')" />
            </q-item>

            <q-item style="padding-left: 0">
              <q-checkbox v-model="indicesStore.stickyTableHeader"
                          :label="$t('indices.indices_table.sticky_table_header.label')" />
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </div>
  </div>

  <div :class="{'table--sticky-header': indicesStore.stickyTableHeader}">
    <resizable-container v-model="resizeStore.indicesTable" :active="indicesStore.stickyTableHeader">
      <q-table :key="tableKey"
               flat
               dense
               row-key="index"
               :virtual-scroll="indicesStore.stickyTableHeader"
               :virtual-scroll-item-size="14"
               :columns="columns"
               :rows="items"
               :rows-per-page-options="rowsPerPage"
               :pagination="{sortBy: 'index'}"
               selection="multiple">
        <template #body="{row}">
          <index-row :index="row" @reload="emit('reload')">
            <template #checkbox>
              <q-checkbox v-model="selectedItems" :val="row.index" size="sm" @update:model-value="setIndeterminate" />
            </template>
          </index-row>
        </template>

        <template #header-selection>
          <q-checkbox v-model="allItemsSelected" size="sm" @update:model-value="checkAll" />
        </template>
      </q-table>

      <div class="q-pa-md">
        <index-bulk :selected-indices="selectedItems"
                    :total-items-count="indices.length"
                    :filtered-items-count="items.length"
                    @reload="emit('reload')"
                    @indices-deleted="clearDeletedIndicesAndReload" />
      </div>
    </resizable-container>
  </div>
</template>

<script setup>
  import { computed, ref, watch } from 'vue'
  import { useTranslation } from '../../composables/i18n'
  import NewIndex from './NewIndex.vue'
  import IndexBulk from './IndexBulk.vue'
  import ResizableContainer from '../shared/ResizableContainer.vue'
  import IndexRow from './IndexRow.vue'
  import ElasticsearchIndex from '../../models/ElasticsearchIndex'
  import { DEFAULT_ROWS_PER_PAGE } from '../../consts'
  import { useSelectableRows } from '../../composables/SelectableRow'
  import { useIndicesStore } from '../../store/indices'
  import { useResizeStore } from '../../store/resize'
  import { filterItems } from '../../helpers/filters'
  import { debounce } from '../../helpers/debounce'
  import FilterInput from '../shared/FilterInput.vue'

  const t = useTranslation()

  const props = defineProps({
    indices: {
      default: () => ([]),
      type: Array
    }
  })

  const emit = defineEmits(['reload'])

  const indicesStore = useIndicesStore()
  const resizeStore = useResizeStore()

  const filter = ref('')
  const items = ref([])
  const tableKey = ref(0)

  const rowsPerPage = computed(() => {
    if (indicesStore.stickyTableHeader) {
      return [0]
    } else {
      return DEFAULT_ROWS_PER_PAGE
    }
  })

  const filterTable = () => {
    let results = props.indices
    if (results.length === 0) return []
    if (!indicesStore.showHiddenIndices) {
      results = results.filter(item => !item.index.match(new RegExp(indicesStore.hideIndicesRegex)))
    }

    results = filterItems(results, filter.value, ['index', 'uuid'])
    items.value = results.map(index => new ElasticsearchIndex(index))
  }

  const debouncedFilterTable = debounce(filterTable, 150)
  watch(() => filter.value, debouncedFilterTable)
  watch(() => indicesStore.showHiddenIndices, filterTable)
  watch(() => props.indices, filterTable)
  watch(() => indicesStore.stickyTableHeader, () => (tableKey.value += 1))

  const { selectedItems, allItemsSelected, setIndeterminate, checkAll } = useSelectableRows(items)

  const clearDeletedIndicesAndReload = () => {
    selectedItems.value = []
    setIndeterminate()
    emit('reload')
  }

  const columns = [
    {
      label: t('indices.indices_table.table.headers.name'), name: 'index', align: 'left', sortable: true, field: 'index'
    },
    {
      label: t('indices.indices_table.table.headers.health'),
      name: 'health',
      align: 'left',
      sortable: true,
      field: 'health'
    },
    {
      label: t('indices.indices_table.table.headers.status'),
      name: 'status',
      align: 'left',
      sortable: true,
      field: 'status'
    },
    {
      label: t('indices.indices_table.table.headers.uuid'),
      name: 'uuid',
      align: 'left',
      sortable: true,
      field: 'uuid'
    },
    { label: t('indices.indices_table.table.headers.aliases'), name: 'aliases', align: 'left' },
    { label: t('indices.indices_table.table.headers.shards'), name: 'parsedPri', sortable: true, field: 'parsedPri' },
    {
      label: t('indices.indices_table.table.headers.docs'),
      name: 'parsedDocsCount',
      sortable: true,
      field: 'parsedDocsCount'
    },
    {
      label: t('indices.indices_table.table.headers.storage'),
      name: 'parsedStoreSize',
      sortable: true,
      field: 'parsedStoreSize'
    },
    { label: '' }
  ]
</script>
