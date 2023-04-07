<template>
  <div class="flex justify-between q-pa-md">
    <new-snapshot-repository @reload="emit('reload')" />
    <filter-input v-model="filter" />
  </div>

  <q-table flat
           dense
           row-key="name"
           :columns="tableColumns"
           :rows="items"
           :rows-per-page-options="DEFAULT_ROWS_PER_PAGE"
           :pagination="{sortBy: 'name'}">
    <template #body="{row}">
      <tr>
        <td>{{ row.name }}</td>
        <td>{{ row.type }}</td>
        <td :title="JSON.stringify(row.settings, null, '\t')">{{ row.settings }}</td>
        <td>
          <q-btn icon="delete" color="dark-grey" @click="deleteRepository(row.name)" />
        </td>
      </tr>
    </template>
  </q-table>
</template>

<script setup lang="ts">
  import FilterInput from '../shared/FilterInput.vue'
  import NewSnapshotRepository from './NewSnapshotRepository.vue'
  import { DEFAULT_ROWS_PER_PAGE } from '../../consts'
  import { useSnapshotRepositoriesTable } from '../../composables/components/repositories/SnapshotRepositoriesTable'
  import { toRefs } from 'vue'

  const props = withDefaults(defineProps<{ repositories: object }>(), {
    repositories: () => ({})
  })
  const emit = defineEmits(['reload'])
  const { repositories } = toRefs(props)
  const { filter, items, deleteRepository, tableColumns } = useSnapshotRepositoriesTable({ repositories, emit })
</script>
