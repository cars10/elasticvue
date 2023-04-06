<template>
  <div class="flex justify-between q-pa-md">
    <new-snapshot-repository @reload="emit('reload')" />
    <filter-input v-model="filter" />
  </div>

  <q-table flat
           dense
           row-key="name"
           :columns="columns"
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
  import { computed, ref } from 'vue'
  import FilterInput from '../shared/FilterInput.vue'
  import { DEFAULT_ROWS_PER_PAGE } from '../../consts'
  import { filterItems } from '../../helpers/filters'
  import { useTranslation } from '../../composables/i18n'
  import NewSnapshotRepository from './NewSnapshotRepository.vue'
  import { useElasticsearchAdapter } from '../../composables/CallElasticsearch'
  import { askConfirm } from '../../helpers/dialogs'
  import { useSnackbar } from '../../composables/Snackbar'

  const t = useTranslation()
  const { showSnackbar } = useSnackbar()

  const props = defineProps({
    repositories: {
      type: Object,
      default: () => ({})
    }
  })
  const emit = defineEmits(['reload'])

  const filter = ref('')
  const items = computed(() => {
    if (Object.keys(props.repositories).length === 0) return []
    const repos = Object.entries(props.repositories).map(([name, repo]) => Object.assign({}, { name }, repo))
    return filterItems(repos, filter.value, ['name'])
  })

  const { requestState, callElasticsearch } = useElasticsearchAdapter()
  const deleteRepository = async name => {
    const confirmed = await askConfirm(t('repositories.repositories_table.delete_repository.confirm', { name }))
    if (!confirmed) return

    try {
      await callElasticsearch('snapshotDeleteRepository', { repository: name })
      emit('reload')
      showSnackbar(requestState.value, { body: t('repositories.repositories_table.delete_repository.growl', { name }) })
    } catch (e) {
      showSnackbar(requestState.value)
    }
  }

  const columns = [
    {
      label: t('repositories.repositories_table.table.headers.name'),
      field: 'name',
      name: 'name',
      sortable: true,
      align: 'left'
    },
    {
      label: t('repositories.repositories_table.table.headers.type'),
      field: 'type',
      name: 'type',
      sortable: true,
      align: 'left'
    },
    { label: t('repositories.repositories_table.table.headers.settings'), align: 'left' },
    { label: '' }
  ]
</script>