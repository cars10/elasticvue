<template>
  <div class="flex justify-between q-pa-md">
    <div class="flex items-center">
      <new-snapshot :repository="repository" @reload="emit('reload')" />
      <filter-state v-model="filter"
                    :results-count="filterStateProps.resultsCount"
                    :filtered-results-count="filterStateProps.filteredResultsCount"
                    class="q-ml-md" />
    </div>

    <filter-input v-model="filter" />
  </div>

  <q-table flat
           class="table-mono table-hide-overflow"
           dense
           row-key="name"
           :columns="columns"
           :rows="filteredResults"
           :rows-per-page-options="DEFAULT_ROWS_PER_PAGE"
           :pagination="{sortBy: 'name'}">
    <template #body="{row}">
      <snapshot-row :snapshot="row" :repository="repository" @reload="emit('reload')" />
    </template>
  </q-table>
</template>

<script setup lang="ts">
  import FilterInput from '../shared/FilterInput.vue'
  import { DEFAULT_ROWS_PER_PAGE } from '../../consts'
  import SnapshotRow from './SnapshotRow.vue'
  import NewSnapshot from './NewSnapshot.vue'
  import { SnapshotsTableProps, useSnapshotsTable } from '../../composables/components/snapshots/SnapshotsTable.ts'
  import FilterState from '../shared/FilterState.vue'

  const props = defineProps<SnapshotsTableProps>()
  const emit = defineEmits(['reload'])

  const { filter, columns, filteredResults, filterStateProps } = useSnapshotsTable(props)
</script>