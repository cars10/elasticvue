<template>
  <div class="flex justify-between q-pa-md">
    <div class="flex">
      <filter-state v-model="searchStore.filter" :results-count="filterStateProps.resultsCount"
                    :filtered-results-count="filterStateProps.filteredResultsCount" />

      <q-btn class="q-ml-md" color="positive" :label="t('search.results_table.add_document')"
             @click="() => handleAddDocument()" />
    </div>

    <div class="flex q-ml-auto">
      <filter-input v-model="searchStore.filter" label="Filter CURRENT PAGE only" />

      <q-btn icon="settings" round flat class="q-ml-sm">
        <q-badge v-if="tableColumns.length !== searchStore.visibleColumns.length" color="positive" rounded floating />

        <q-menu style="white-space: nowrap" anchor="bottom right" self="top end">
          <q-list dense class="q-pb-sm">
            <q-item style="padding-left: 6px">
              <q-checkbox v-model="searchStore.stickyTableHeader" size="32px"
                          :label="t('indices.indices_table.sticky_table_header.label')" />
            </q-item>

            <q-separator />

            <q-item class="q-mt-sm">
              <q-item-label style="flex-grow: 1">
                <div class="flex justify-between items-center" style="flex-grow: 1">
                  {{ t('search.results_table.settings.columns') }}

                  <q-btn :label="t('shared.table_settings.clear')" flat size="sm" class="q-px-xs"
                         @click="clearColumns" />
                  <q-btn :label="t('shared.table_settings.reset')" flat size="sm" class="q-px-xs"
                         @click="resetColumns" />
                  <q-btn :label="t('shared.table_settings.reset_order')" flat size="sm" class="q-px-xs"
                         @click="resetColumnOrder" />
                  <q-btn v-if="hasActiveSorts" :label="t('shared.table_settings.clear_sorts')" flat size="sm" class="q-px-xs"
                         @click="clearAllSorts" />
                </div>
              </q-item-label>
            </q-item>

            <q-item v-for="(col, index) in slicedTableColumns" :key="col.name" style="padding-left: 8px" dense>
              <q-checkbox v-model="searchStore.visibleColumns" :val="col.name" :label="col.label" size="32px"
                          style="flex-grow: 1" />
              <div class="q-ml-sm">
                <q-btn 
                  v-if="index > 0"
                  icon="keyboard_double_arrow_up" 
                  size="sm" 
                  flat 
                  round 
                  dense
                  @click="moveColumnToTop(index)"
                  class="q-mr-xs"
                  :title="t('shared.table_settings.move_to_top')"
                />
                <q-btn 
                  v-if="index > 0"
                  icon="keyboard_arrow_up" 
                  size="sm" 
                  flat 
                  round 
                  dense
                  @click="moveColumnUp(index)"
                  class="q-mr-xs"
                  :title="t('shared.table_settings.move_up')"
                />
                <q-btn 
                  v-if="index < slicedTableColumns.length - 1"
                  icon="keyboard_arrow_down" 
                  size="sm" 
                  flat 
                  round 
                  dense
                  @click="moveColumnDown(index)"
                  class="q-mr-xs"
                  :title="t('shared.table_settings.move_down')"
                />
                <q-btn 
                  v-if="index < slicedTableColumns.length - 1"
                  icon="keyboard_double_arrow_down" 
                  size="sm" 
                  flat 
                  round 
                  dense
                  @click="moveColumnToBottom(index)"
                  :title="t('shared.table_settings.move_to_bottom')"
                />
              </div>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </div>
  </div>

  <div :class="{'table--sticky-header': searchStore.stickyTableHeader}">
    <resizable-container v-model="resizeStore.searchTable" :active="searchStore.stickyTableHeader">
      <q-table v-if="hits.length > 0"
               v-model:pagination="searchStore.pagination"
               v-draggable-table="{ options: { mode: 'column' }, onDrop: onDropColumn }"
               class="table-mono table-hide-overflow"
               flat
               dense
               :virtual-scroll="searchStore.stickyTableHeader"
               :virtual-scroll-item-size="14"
               :columns="orderedTableColumns"
               :columns_filter="true" 
               :rows="filteredHits"
               :visible-columns="orderedVisibleColumns"
               selection="multiple"
               @request="onRequest">
        <template #body="{row, cols}">
          <search-result 
            :columns="cols" 
            :doc="row" 
            :has-multiple-selections="selectedItems.length > 1"
            @reload="reload"
            @row-context-menu="handleRowContextMenu"
            @cell-context-menu="handleCellContextMenu"
          >
            <template #checkbox>
              <q-checkbox v-model="selectedItems" :val="genDocStr(row)" size="32px"
                          @update:model-value="setIndeterminate" />
            </template>
          </search-result>
        </template>

        <template #header-selection>
          <q-checkbox v-model="allItemsSelected" size="32px" @update:model-value="checkAll" />
        </template> 

        <template #header="props">
          <q-tr :props="props">
            <q-th auto-width>
              <q-checkbox v-model="allItemsSelected" size="32px" @update:model-value="checkAll" />
            </q-th>
            <q-th
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
              :class="{ 'cursor-pointer': col.sortableCol }"
              @click="col.sortableCol ? toggleColumnSort(col.name) : null"
            >
              <div style="display: inline-block;">
                <span class="q-mr-xs">{{ col.label }}</span>
                  <q-icon
                    v-if="getColumnSortOrder(col.name) === 'asc'"
                    name="keyboard_arrow_up"
                    size="16px"
                    class="q-mr-xs"
                  />
                  <q-icon
                    v-else-if="getColumnSortOrder(col.name) === 'desc'"
                    name="keyboard_arrow_down"
                    size="16px"
                    class="q-mr-xs"
                  />
                  <q-icon
                    v-else
                    name="unfold_more"
                    size="16px"
                    class="q-mr-xs text-grey-5"
                  />
                  <q-badge
                    v-if="getColumnSortPriority(col.name)"
                    :label="getColumnSortPriority(col.name)"
                    color="primary"
                    text-color="white"
                    class="q-ml-xs"
                    style="min-width: 16px; height: 16px; font-size: 10px;"
                  />
              </div>
            </q-th>
          </q-tr>
        </template>

        <template #bottom="scope">
          <table-bottom v-model="searchStore.pagination.rowsPerPage"
                        :scope="scope"
                        :total="hits.length"
                        :rows-per-page="rowsPerPage"
                        @rows-per-page-accepted="acceptRowsPerPage" />
        </template>
      </q-table>
      <div v-else class="q-ma-md text-center">No Documents found</div>
    </resizable-container>
  </div>

  <context-menu
    v-model="contextMenuVisible"
    :target="contextMenuTarget"
    :row-data="contextMenuRowData"
    :cell-content="contextMenuCellContent"
    :selected-rows="contextMenuSelectedRows"
    :is-multiple-selection="contextMenuIsMultipleSelection"
    @edit-document="handleEditDocument"
    @add-document="handleAddDocument"
  />

  <div class="flex justify-between">
    <div class="q-pa-md">
      <search-results-bulk v-if="hits.length > 0"
                           :selected="selectedItems"
                           :total-items-count="hits.length"
                           :filtered-items-count="hits.length"
                           @reload="reload" />
    </div>

    <div class="q-pa-md ">
      <download-button color="dark-grey"
                       :disable="hits.length === 0"
                       size="12px"
                       download="search.json"
                       :label="t('search.results_table.download_as_json')"
                       :generate-download-data="generateDownloadData" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import FilterInput from '../shared/FilterInput.vue'
  import ResizableContainer from '../shared/ResizableContainer.vue'
  import SearchResult from './SearchResult.vue'
  import DownloadButton from '../shared/DownloadButton.vue'
  import { useTranslation } from '../../composables/i18n.ts'
  import SearchResultsBulk from './SearchResultsBulk.vue'
  import {
    SearchResultsTableProps,
    useSearchResultsTable
  } from '../../composables/components/search/SearchResultsTable.ts'
  import TableBottom from '../shared/TableBottom.vue'
  import FilterState from '../shared/FilterState.vue'
  import ContextMenu from '../shared/ContextMenu.vue'

  const props = defineProps<SearchResultsTableProps>()
  const emit = defineEmits(['request', 'reload', 'edit-document','add-document'])

  const t = useTranslation()

  const {
    filterStateProps,
    acceptRowsPerPage,
    tableColumns,
    orderedTableColumns,
    orderedVisibleColumns,
    searchStore,
    clearColumns,
    resetColumns,
    slicedTableColumns,
    resizeStore,
    hits,
    filteredHits,
    rowsPerPage,
    onRequest,
    reload,
    selectedItems,
    genDocStr,
    setIndeterminate,
    allItemsSelected,
    checkAll,
    generateDownloadData,
    updateColumnOrder,
    resetColumnOrder,
    toggleColumnSort,
    clearAllSorts,
    getColumnSortOrder,
    getColumnSortPriority,
    hasActiveSorts,
    onDropColumn
  } = useSearchResultsTable(props, emit)
  
  const contextMenuVisible = ref(false)
  const contextMenuTarget = ref<HTMLElement | null>(null)
  const contextMenuRowData = ref<any>(null)
  const contextMenuCellContent = ref<string>('')
  const contextMenuSelectedRows = ref<any[]>([])
  const contextMenuIsMultipleSelection = ref(false)

  const moveColumnUp = (index: number) => {
    const newOrder = [...searchStore.pagination.columnOrder]
    const currentColumn = newOrder[index]
    const previousColumn = newOrder[index - 1]
    
    newOrder[index] = previousColumn
    newOrder[index - 1] = currentColumn
    
    updateColumnOrder(newOrder)

    onRequest(searchStore.pagination)
  }

  const moveColumnDown = (index: number) => {
    const newOrder = [...searchStore.pagination.columnOrder]
    const currentColumn = newOrder[index]
    const nextColumn = newOrder[index + 1]
    
    newOrder[index] = nextColumn
    newOrder[index + 1] = currentColumn
    
    updateColumnOrder(newOrder)

    onRequest(searchStore.pagination)
  }

  const moveColumnToTop = (index: number) => {
    const newOrder = [...searchStore.pagination.columnOrder]
    const currentColumn = newOrder[index]
    
    newOrder.splice(index, 1)
    newOrder.unshift(currentColumn)
    
    updateColumnOrder(newOrder)

    onRequest(searchStore.pagination)
  }

  const moveColumnToBottom = (index: number) => {
    const newOrder = [...searchStore.pagination.columnOrder]
    const currentColumn = newOrder[index]

    newOrder.splice(index, 1)
    newOrder.splice(newOrder.length - 1, 0, currentColumn)
    
    updateColumnOrder(newOrder)

    onRequest(searchStore.pagination)
  }

  const handleRowContextMenu = (event: MouseEvent, rowData: any) => {
    event.preventDefault()
    event.stopPropagation()
    
    const hasMultipleSelections = selectedItems.value.length > 1
    
    if (hasMultipleSelections) {
      contextMenuSelectedRows.value = hits.value.filter(hit => 
        selectedItems.value.includes(genDocStr(hit))
      )
      contextMenuIsMultipleSelection.value = true
      contextMenuCellContent.value = '' 
    } else {
      contextMenuRowData.value = rowData
      contextMenuIsMultipleSelection.value = false
    }
    
    contextMenuTarget.value = event.currentTarget as HTMLElement
    contextMenuVisible.value = true
  }

  const handleCellContextMenu = (event: MouseEvent, rowData: any, cellContent: string) => {
    event.preventDefault()
    event.stopPropagation()
    
    if (selectedItems.value.length > 1) {
      return
    }
    
    contextMenuRowData.value = rowData
    contextMenuCellContent.value = cellContent
    contextMenuIsMultipleSelection.value = false
    contextMenuTarget.value = event.currentTarget as HTMLElement
    contextMenuVisible.value = true
  }

  const handleEditDocument = (rowData: any) => {
    emit('edit-document', rowData)
  }
  const handleAddDocument = (rowData?: any) => {
    if (rowData) {
      emit('add-document', rowData)
    } else {
      emit('add-document')
    }
  }
</script>