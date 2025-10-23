<template>
  <div class="flex justify-between q-pa-md">
    <div class="flex items-center">
      <new-index @reload="emit('reload')" />
      <index-import @done="emit('reload')" />
      <router-link v-if="clusterVersionGte(5)" to="index_templates" class="q-ml-md">
        {{ t('index_templates.heading') }}
      </router-link>

      <filter-state
        v-model="indicesStore.filter"
        :results-count="filterStateProps.resultsCount"
        :filtered-results-count="filterStateProps.filteredResultsCount"
        class="q-ml-md"
      />
    </div>

    <div class="flex">
      <filter-input v-model="indicesStore.filter" :columns="['index', 'uuid']" />

      <q-btn icon="settings" round flat class="q-ml-sm">
        <q-menu style="white-space: nowrap" anchor="bottom right" self="top end">
          <q-list dense>
            <q-item style="padding-left: 0">
              <q-checkbox
                v-model="indicesStore.showHiddenIndices"
                size="32px"
                :label="t('indices.indices_table.show_hidden_indices.label')"
              />
            </q-item>

            <q-item style="padding-left: 0">
              <q-checkbox
                v-model="indicesStore.stickyTableHeader"
                size="32px"
                :label="t('indices.indices_table.sticky_table_header.label')"
              />
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </div>
  </div>

  <div :class="{ 'table--sticky-header': indicesStore.stickyTableHeader }">
    <resizable-container v-model="resizeStore.indicesTable" :active="indicesStore.stickyTableHeader">
      <q-table
        :key="tableKey"
        v-model:pagination="indicesStore.pagination"
        class="table-mono table-hide-overflow"
        flat
        dense
        data-testid="indices-table"
        row-key="index"
        :virtual-scroll="indicesStore.stickyTableHeader"
        :virtual-scroll-item-size="14"
        :columns="columns"
        :rows="items"
        selection="multiple"
      >
        <template #body="{ row }">
          <index-row :index="row" @reload="emit('reload')" @index-deleted="reloadSelectedItems">
            <template #checkbox>
              <q-checkbox v-model="selectedItems" :val="row.index" size="32px" @update:model-value="setIndeterminate" />
            </template>
          </index-row>
        </template>

        <template #header-selection>
          <q-checkbox v-model="allItemsSelected" size="32px" @update:model-value="checkAll" />
        </template>

        <template #bottom="scope">
          <table-bottom
            v-model="indicesStore.pagination.rowsPerPage"
            :scope="scope"
            :total="items.length"
            :rows-per-page="rowsPerPage"
            @rows-per-page-accepted="acceptRowsPerPage"
          />
        </template>
      </q-table>
    </resizable-container>

    <div v-if="indices.length > 0" class="q-pa-md">
      <index-bulk
        :selected-indices="selectedItems"
        :total-items-count="indices.length"
        :filtered-items-count="items.length"
        @reload="emit('reload')"
        @indices-deleted="clearDeletedIndicesAndReload"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import FilterInput from '../shared/FilterInput.vue'
  import TableBottom from '../shared/TableBottom.vue'
  import IndexBulk from './IndexBulk.vue'
  import IndexRow from './IndexRow.vue'
  import IndexImport from './IndexImport.vue'
  import NewIndex from './NewIndex.vue'
  import ResizableContainer from '../shared/ResizableContainer.vue'
  import { useTranslation } from '../../composables/i18n'
  import { EsTableProps, useIndicesTable } from '../../composables/components/indices/IndicesTable'
  import FilterState from '../shared/FilterState.vue'
  import { clusterVersionGte } from '../../helpers/minClusterVersion.ts'

const t = useTranslation()

const props = defineProps<EsTableProps>()
const emit = defineEmits(['reload'])

const {
  checkAll,
  indicesStore,
  resizeStore,
  items,
  filterStateProps,
  tableKey,
  rowsPerPage,
  selectedItems,
  reloadSelectedItems,
  allItemsSelected,
  acceptRowsPerPage,
  setIndeterminate,
  clearDeletedIndicesAndReload,
  columns
} = useIndicesTable(props, emit)
</script>
