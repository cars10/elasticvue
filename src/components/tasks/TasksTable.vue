<template>
  <div class="flex justify-between q-pa-md">
    <filter-state v-model="tasksStore.filter" :results-count="resultsCount" :filtered-results-count="filteredResultsCount" />

    <div class="flex items-center q-ml-auto">
      <q-select
        v-model="visibleTypes"
        :options="types"
        :label="t('tasks.table.types')"
        :display-value="typesLabel"
        multiple
        dense
        outlined
        class="q-mr-md"
        style="min-width: 160px"
        data-testid="tasks-types"
      />
      <q-select
        v-model="visibleCategories"
        :options="categoryOptions"
        :label="t('tasks.table.categories')"
        :display-value="categoriesLabel"
        emit-value
        map-options
        multiple
        dense
        outlined
        class="q-mr-md"
        style="min-width: 160px"
        data-testid="tasks-categories"
      />
      <filter-input v-model="tasksStore.filter" :columns="FILTER_COLUMNS" />

      <q-btn icon="settings" round flat class="q-ml-sm">
        <q-menu style="white-space: nowrap" anchor="bottom right" self="top end">
          <q-list dense>
            <q-item style="padding-left: 0">
              <q-checkbox
                v-model="tasksStore.stickyTableHeader"
                size="32px"
                :label="t('index_templates.index_templates_table.sticky_table_header.label')"
              />
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </div>
  </div>

  <div :class="{ 'table--sticky-header': tasksStore.stickyTableHeader, 'q-pb-md': true }">
    <resizable-container v-model="resizeStore.tasksTable" :active="tasksStore.stickyTableHeader">
      <q-table
        v-model:pagination="tasksStore.pagination"
        class="table-mono"
        flat
        dense
        row-key="id"
        :columns="columns"
        :virtual-scroll="tasksStore.stickyTableHeader"
        :virtual-scroll-item-size="14"
        :rows="filteredResults"
        :rows-per-page-options="DEFAULT_ROWS_PER_PAGE"
        data-testid="tasks-table"
      >
        <template #body="{ row }">
          <task-row :key="row.id" :task="row" @reload="emit('reload')" />
        </template>

        <template #no-data>
          <div class="full-width row items-center justify-center q-pa-md text-muted">{{ t('tasks.table.no_tasks') }}</div>
        </template>
      </q-table>
    </resizable-container>
  </div>
</template>

<script setup lang="ts">
import FilterState from '../shared/FilterState.vue'
import FilterInput from '../shared/FilterInput.vue'
import ResizableContainer from '../shared/ResizableContainer.vue'
import TaskRow from './TaskRow.vue'
import { useTranslation } from '../../composables/i18n.ts'
import { DEFAULT_ROWS_PER_PAGE } from '../../consts.ts'
import { useResizeStore } from '../../store/resize.ts'
import { useTasksStore } from '../../store/tasks.ts'
import { FILTER_COLUMNS, TasksTableProps, useTasksTable } from '../../composables/components/tasks/TasksTable.ts'

const props = defineProps<TasksTableProps>()
const emit = defineEmits<{ reload: [] }>()

const t = useTranslation()
const tasksStore = useTasksStore()
const resizeStore = useResizeStore()

const {
  resultsCount,
  filteredResultsCount,
  filteredResults,
  visibleTypes,
  typesLabel,
  categoryOptions,
  visibleCategories,
  categoriesLabel,
  columns
} = useTasksTable(props)
</script>
