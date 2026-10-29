<template>
  <div>
    <div class="row no-wrap items-center q-px-md q-pt-sm">
      <q-tabs v-model="activeTab" dense no-caps align="left" class="col">
        <q-tab name="hits" :label="t('search.results_table.tabs.hits')" />
        <q-tab name="aggregations" :label="t('search.results_table.tabs.aggregations')" :disable="!hasAggregations" />
      </q-tabs>

      <div class="row no-wrap items-center q-gutter-x-sm">
        <span class="text-muted font-13 tabular-nums" data-testid="search-total">
          {{ t('search.results_table.total', { count: formattedTotal }, total.value) }}
        </span>
        <q-btn
          v-if="!total.exact"
          flat
          dense
          no-caps
          size="sm"
          color="primary"
          :label="t('search.results_table.count_exactly')"
          data-testid="search-count-exactly"
          @click="emit('countExactly')"
        />
        <span v-if="results.took !== undefined" class="text-muted font-13 tabular-nums" data-testid="search-took">
          {{ results.took }} ms
        </span>
      </div>
    </div>
    <q-separator />

    <q-tab-panels v-model="activeTab">
      <q-tab-panel name="hits" class="q-pa-none">
        <div class="row no-wrap items-center justify-end q-px-md q-py-sm q-gutter-x-sm">
          <search-columns
            :model-value="columns"
            :options="options"
            :catalog-skipped="catalogSkipped"
            @update:model-value="searchStore.setColumns"
            @reset="searchStore.resetColumns()"
          />

          <q-btn icon="settings" round flat dense data-testid="search-table-settings">
            <q-menu style="white-space: nowrap" anchor="bottom right" self="top end">
              <q-list dense>
                <q-item style="padding-left: 6px">
                  <q-checkbox
                    v-model="searchStore.stickyTableHeader"
                    size="32px"
                    :label="t('indices.indices_table.sticky_table_header.label')"
                  />
                </q-item>
                <q-item style="padding-left: 6px">
                  <q-checkbox
                    v-model="searchStore.sourceOnlyVisible"
                    size="32px"
                    :label="t('search.results_table.source_only_visible')"
                    data-testid="search-source-only-visible"
                  />
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>

        <div :class="{ 'table--sticky-header': searchStore.stickyTableHeader }">
          <resizable-container v-model="resizeStore.searchTable" :active="searchStore.stickyTableHeader">
            <q-table
              v-model:pagination="searchStore.pagination"
              class="table-mono table-hide-overflow"
              flat
              dense
              data-testid="search-results-table"
              :row-key="hitKey"
              :columns="tableColumns"
              :rows="hits"
              :loading="loading"
              :virtual-scroll="searchStore.stickyTableHeader"
              :virtual-scroll-item-size="14"
              selection="multiple"
              @request="(request: any) => emit('request', request)"
            >
              <template #header-selection>
                <q-checkbox v-model="allItemsSelected" size="32px" @update:model-value="checkAll" />
              </template>

              <template #body="{ row }">
                <search-result :hit="row" :columns="columns" :catalog="catalog" @reload="reload" @open="emit('open', row)">
                  <template #checkbox>
                    <q-checkbox v-model="selectedItems" :val="hitKey(row)" size="32px" @update:model-value="setIndeterminate" />
                  </template>
                </search-result>
              </template>

              <template #no-data>
                <div v-if="!loading" class="full-width text-center text-muted q-pa-md" data-testid="search-no-results">
                  {{ t('search.results_table.no_results') }}
                </div>
              </template>

              <template #bottom="scope">
                <table-bottom
                  :model-value="searchStore.pagination.rowsPerPage"
                  :scope="scope"
                  :total="hits.length"
                  :rows-per-page="rowsPerPage"
                  @update:model-value="onRowsPerPageSelect"
                  @rows-per-page-accepted="acceptRowsPerPage"
                />
              </template>
            </q-table>
          </resizable-container>
        </div>

        <div class="row items-center justify-between q-pa-md">
          <search-results-bulk
            :selected="selectedItems"
            :total-items-count="hits.length"
            :filtered-items-count="hits.length"
            @reload="reload"
          />

          <q-btn-dropdown
            color="dark-grey"
            size="12px"
            icon="file_download"
            :label="t('search.results_table.download')"
            :disable="hits.length === 0"
            :loading="downloading"
            data-testid="search-download"
          >
            <q-list dense>
              <q-item
                v-close-popup
                clickable
                data-testid="search-download-csv"
                @click="download('search.csv', generateCsv, 'text/csv')"
              >
                <q-item-section>CSV</q-item-section>
              </q-item>
              <q-item
                v-close-popup
                clickable
                data-testid="search-download-json"
                @click="download('search.json', generateDownloadData)"
              >
                <q-item-section>JSON</q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </div>
      </q-tab-panel>

      <q-tab-panel name="aggregations">
        <resizable-container v-model="resizeStore.searchTable">
          <code-viewer :value="aggregationsJson" />
        </resizable-container>
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import ResizableContainer from '../shared/ResizableContainer.vue'
import { useDownload } from '../../composables/Download.ts'
import TableBottom from '../shared/TableBottom.vue'
import SearchResult from './SearchResult.vue'
import SearchResultsBulk from './SearchResultsBulk.vue'
import SearchColumns from './SearchColumns.vue'
import { useTranslation } from '../../composables/i18n.ts'
import { hitKey, SearchResultsTableProps, useSearchResultsTable } from '../../composables/components/search/SearchResultsTable.ts'

const CodeViewer = defineAsyncComponent(() => import('../shared/CodeViewer.vue'))

const props = defineProps<SearchResultsTableProps & { total: { value: number; exact: boolean } }>()
const emit = defineEmits(['request', 'reload', 'countExactly', 'open'])
const t = useTranslation()
const { download, loading: downloading } = useDownload()
const formattedTotal = computed(() => `${props.total.value.toLocaleString()}${props.total.exact ? '' : '+'}`)

const {
  searchStore,
  resizeStore,
  activeTab,
  hits,
  options,
  columns,
  tableColumns,
  selectedItems,
  allItemsSelected,
  setIndeterminate,
  checkAll,
  reload,
  rowsPerPage,
  onRowsPerPageSelect,
  acceptRowsPerPage,
  hasAggregations,
  aggregationsJson,
  generateDownloadData,
  generateCsv
} = useSearchResultsTable(props, emit)
</script>
