<template>
  <div class="flex justify-between q-pa-md">
    <div class="flex items-center">
      <filter-state
        v-model="indexTemplatesStore.filter"
        :results-count="filterStateProps.resultsCount"
        :filtered-results-count="filterStateProps.filteredResultsCount"
      />
    </div>

    <div class="flex">
      <filter-input v-model="indexTemplatesStore.filter" :columns="FILTER_COLUMNS" />

      <q-btn icon="settings" round flat class="q-ml-sm">
        <q-menu style="white-space: nowrap" anchor="bottom right" self="top end">
          <q-list dense>
            <q-item style="padding-left: 0">
              <q-checkbox
                v-model="indexTemplatesStore.showHiddenIndices"
                size="32px"
                :label="t('index_templates.index_templates_table.show_hidden_templates.label')"
              />
            </q-item>

            <q-item style="padding-left: 0">
              <q-checkbox
                v-model="indexTemplatesStore.stickyTableHeader"
                size="32px"
                :label="t('index_templates.index_templates_table.sticky_table_header.label')"
              />
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </div>
  </div>

  <div :class="{ 'table--sticky-header': indexTemplatesStore.stickyTableHeader }">
    <resizable-container v-model="resizeStore.indexTemplatesTable" :active="indexTemplatesStore.stickyTableHeader">
      <q-table
        v-model:pagination="indexTemplatesStore.pagination"
        class="table-mono table-hide-overflow"
        flat
        dense
        data-testid="index-templates-table"
        :row-key="(row: IndexTemplate) => `${row.type}-${row.name}`"
        :columns="columns"
        :virtual-scroll="indexTemplatesStore.stickyTableHeader"
        :virtual-scroll-item-size="14"
        :rows="filteredItems"
        :rows-per-page-options="DEFAULT_ROWS_PER_PAGE"
      >
        <template #body="{ row }: { row: IndexTemplate }">
          <index-template-row :row="row" @show-template="(name: string) => (indexTemplatesStore.filter = name)" />
        </template>
      </q-table>
    </resizable-container>
  </div>
</template>

<script setup lang="ts">
import FilterInput from '../shared/FilterInput.vue'
import FilterState from '../shared/FilterState.vue'
import { DEFAULT_ROWS_PER_PAGE } from '../../consts'
import {
  FILTER_COLUMNS,
  IndexTemplatesTableProps,
  useIndexTemplatesTable
} from '../../composables/components/indextemplates/IndexTemplatesTable'
import IndexTemplateRow from './IndexTemplateRow.vue'
import { useIndexTemplatesStore } from '../../store/indexTemplates.ts'
import { useTranslation } from '../../composables/i18n.ts'
import ResizableContainer from '../shared/ResizableContainer.vue'
import { useResizeStore } from '../../store/resize.ts'
import type { IndexTemplate } from '../../types/indexTemplates.ts'

const props = defineProps<IndexTemplatesTableProps>()
const indexTemplatesStore = useIndexTemplatesStore()
const resizeStore = useResizeStore()

const t = useTranslation()

const { filteredItems, filterStateProps, columns } = useIndexTemplatesTable(props)
</script>
