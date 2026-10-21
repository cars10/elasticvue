<template>
  <div class="flex justify-between q-pa-md">
    <div class="flex items-center">
      <new-snapshot-repository @reload="emit('reload')" />
      <filter-state
        v-model="snapshotRepositoriesStore.filter"
        :results-count="filterStateProps.resultsCount"
        :filtered-results-count="filterStateProps.filteredResultsCount"
        class="q-ml-md"
      />
    </div>

    <filter-input v-model="snapshotRepositoriesStore.filter" :columns="['name', 'type', 'location']" />
  </div>

  <q-table
    flat
    class="table-mono table-hide-overflow"
    dense
    row-key="name"
    :columns="columns"
    :rows="filteredResults"
    :rows-per-page-options="DEFAULT_ROWS_PER_PAGE"
    v-model:pagination="snapshotRepositoriesStore.pagination"
  >
    <template #body="{ row }: { row: RepositoryRowData }">
      <repository-row :repository="row" :slm="slm" @reload="emit('reload')" />
    </template>
  </q-table>
</template>

<script setup lang="ts">
import FilterInput from '../shared/FilterInput.vue'
import FilterState from '../shared/FilterState.vue'
import NewSnapshotRepository from './NewSnapshotRepository.vue'
import RepositoryRow from './RepositoryRow.vue'
import { DEFAULT_ROWS_PER_PAGE } from '../../consts'
import {
  SnapshotRepositoriesTableProps,
  useSnapshotRepositoriesTable
} from '../../composables/components/repositories/SnapshotRepositoriesTable'
import { useSnapshotRepositoriesStore } from '../../store/snapshot_repositories.ts'
import type { RepositoryRow as RepositoryRowData } from '../../types/snapshots.ts'

const snapshotRepositoriesStore = useSnapshotRepositoriesStore()
const props = defineProps<SnapshotRepositoriesTableProps>()
const emit = defineEmits(['reload'])
const { filterStateProps, filteredResults, columns } = useSnapshotRepositoriesTable(props)
</script>
