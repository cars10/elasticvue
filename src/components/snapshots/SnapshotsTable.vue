<template>
  <div class="flex justify-between q-pa-md">
    <new-snapshot :repository="repository" @reload="emit('reload')" />
    <filter-input v-model="filter" />
  </div>

  <q-table flat
           dense
           row-key="name"
           :columns="tableColumns"
           :rows="snapshots"
           :rows-per-page-options="DEFAULT_ROWS_PER_PAGE"
           :pagination="{sortBy: 'name'}">
    <template #body="{row}">
      <snapshot-row :snapshot="row" :repository="repository" @reload="emit('reload')" />
    </template>
  </q-table>
</template>

<script setup lang="ts">
  import FilterInput from '../shared/FilterInput.vue'
  import { ref } from 'vue'
  import { DEFAULT_ROWS_PER_PAGE } from '../../consts'
  import { genColumns } from '../../helpers/tableColumns'
  import { useTranslation } from '../../composables/i18n'
  import SnapshotRow from './SnapshotRow.vue'
  import NewSnapshot from './NewSnapshot.vue'

  withDefaults(defineProps<{ snapshots: object, repository: string }>(), {
    snapshots: () => {
      return []
    }
  })
  const emit = defineEmits(['reload'])

  const t = useTranslation()
  const filter = ref('')
  const tableColumns = genColumns([
    { label: 'id' },
    { label: t('snapshots.snapshots_table.table.headers.status'), field: 'status' },
    { label: t('snapshots.snapshots_table.table.headers.start_time') },
    { label: t('snapshots.snapshots_table.table.headers.end_time') },
    { label: t('snapshots.snapshots_table.table.headers.duration') },
    { label: t('snapshots.snapshots_table.table.headers.indices'), field: 'indices' },
    { label: t('snapshots.snapshots_table.table.headers.successful_shards'), field: 'successful_shards' },
    { label: t('snapshots.snapshots_table.table.headers.failed_shards'), field: 'failed_shards' },
    { label: t('snapshots.snapshots_table.table.headers.total_shards'), field: 'total_shards' },
    { label: '' }
  ])
</script>