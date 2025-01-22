<template>
  <div class="flex justify-between q-pa-md">
    <div class="flex items-center">
      <new-snapshot-repository @reload="emit('reload')" />
      <filter-state v-model="filter"
                    :results-count="filterStateProps.resultsCount"
                    :filtered-results-count="filterStateProps.filteredResultsCount"
                    class="q-ml-md" />
    </div>

    <filter-input v-model="filter" :columns="['name']" />
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
      <tr class="clickable" @click="openSnapshots(row.name)">
        <td>{{ row.name }}</td>
        <td>{{ row.type }}</td>
        <td :title="JSON.stringify(row.settings, null, '\t')">{{ row.settings }}</td>
        <td>
          <q-btn-group>
            <q-btn label="Snapshots"
                   icon="settings_backup_restore"
                   color="dark-grey"
                   @click.stop="openSnapshots(row.name)" />
            <q-btn icon="delete" color="dark-grey" @click.stop="deleteRepository(row.name)" />
          </q-btn-group>
        </td>
      </tr>
    </template>
  </q-table>
</template>

<script setup lang="ts">
  import FilterInput from '../shared/FilterInput.vue'
  import NewSnapshotRepository from './NewSnapshotRepository.vue'
  import { DEFAULT_ROWS_PER_PAGE } from '../../consts'
  import {
    SnapshotRepositoriesTableProps,
    useSnapshotRepositoriesTable
  } from '../../composables/components/repositories/SnapshotRepositoriesTable'
  import FilterState from '../shared/FilterState.vue'

  const props = defineProps<SnapshotRepositoriesTableProps>()
  const emit = defineEmits(['reload'])
  const {
    filter,
    filterStateProps,
    filteredResults,
    deleteRepository,
    columns,
    openSnapshots
  } = useSnapshotRepositoriesTable(props, emit)
</script>
