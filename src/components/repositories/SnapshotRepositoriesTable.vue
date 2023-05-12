<template>
  <div class="flex justify-between q-pa-md">
    <new-snapshot-repository @reload="emit('reload')" />
    <filter-input v-model="filter" />
  </div>

  <q-table flat
           class="table-mono"
           dense
           row-key="name"
           :columns="tableColumns"
           :rows="items"
           :rows-per-page-options="DEFAULT_ROWS_PER_PAGE"
           :pagination="{sortBy: 'name'}">
    <template #body="{row}">
      <q-tr class="clickable" @click="openSnapshots(row.name)">
        <q-td>{{ row.name }}</q-td>
        <q-td>{{ row.type }}</q-td>
        <q-td :title="JSON.stringify(row.settings, null, '\t')">{{ row.settings }}</q-td>
        <q-td>
          <q-btn-group>
            <q-btn label="Snapshots"
                   icon="settings_backup_restore"
                   color="dark-grey"
                   @click.stop="openSnapshots(row.name)" />
            <q-btn icon="delete" color="dark-grey" @click.stop="deleteRepository(row.name)" />
          </q-btn-group>
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>

<script setup lang="ts">
  import FilterInput from '../shared/FilterInput.vue'
  import NewSnapshotRepository from './NewSnapshotRepository.vue'
  import { DEFAULT_ROWS_PER_PAGE } from '../../consts'
  import { useSnapshotRepositoriesTable } from '../../composables/components/repositories/SnapshotRepositoriesTable'
  import { toRefs } from 'vue'
  import { useRouter } from 'vue-router'

  const props = withDefaults(defineProps<{ repositories: object }>(), {
    repositories: () => ({})
  })
  const emit = defineEmits(['reload'])
  const { repositories } = toRefs(props)
  const { filter, items, deleteRepository, tableColumns } = useSnapshotRepositoriesTable({ repositories, emit })

  const router = useRouter()
  const openSnapshots = (repositoryName: string) => (router.push({ name: 'snapshots', params: { repositoryName } }))
</script>
