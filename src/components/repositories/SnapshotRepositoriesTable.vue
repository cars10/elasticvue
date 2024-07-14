<template>
  <div class="flex justify-between q-pa-md">
    <new-snapshot-repository @reload="emit('reload')" />
    <filter-input v-model="filter" />
  </div>

  <q-table flat
           class="table-mono table-hide-overflow"
           dense
           row-key="name"
           :columns="tableColumns"
           :rows="items"
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
  import { useRouter } from 'vue-router'
  import FilterInput from '../shared/FilterInput.vue'
  import NewSnapshotRepository from './NewSnapshotRepository.vue'
  import { DEFAULT_ROWS_PER_PAGE } from '../../consts'
  import {
    SnapshotRepositoriesTableProps,
    useSnapshotRepositoriesTable
  } from '../../composables/components/repositories/SnapshotRepositoriesTable'

  const props = defineProps<SnapshotRepositoriesTableProps>()
  const emit = defineEmits(['reload'])
  const { filter, items, deleteRepository, tableColumns } = useSnapshotRepositoriesTable(props, emit)

  const router = useRouter()
  const openSnapshots = (repositoryName: string) => (router.push({ name: 'snapshots', params: { repositoryName } }))
</script>
