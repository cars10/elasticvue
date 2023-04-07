import { useTranslation } from '../../i18n'
import { computed, Ref, ref } from 'vue'
import { filterItems } from '../../../helpers/filters'
import { defineElasticsearchRequest } from '../../CallElasticsearch'
import { genColumns } from '../../../helpers/tableColumns'

export const useSnapshotRepositoriesTable = ({ repositories, emit }: {
  repositories: Ref<object>,
  emit: any
}) => {
  const t = useTranslation()

  const filter = ref('')
  const items = computed(() => {
    if (Object.keys(repositories.value).length === 0) return []
    const repos = Object.entries(repositories.value).map(([name, repo]) => Object.assign({}, { name }, repo))
    return filterItems(repos, filter.value, ['name'])
  })

  const callDelete = defineElasticsearchRequest({ emit, method: 'snapshotDeleteRepository' })
  const deleteRepository = async (name: string) => {
    return callDelete({
      confirmMsg: t('repositories.repositories_table.delete_repository.confirm', { name }),
      params: { repository: name },
      snackbarOptions: { body: t('repositories.repositories_table.delete_repository.growl', { name }) }
    })
  }

  const tableColumns = genColumns([
    { label: t('repositories.repositories_table.table.headers.name'), field: 'name' },
    { label: t('repositories.repositories_table.table.headers.type'), field: 'type' },
    { label: t('repositories.repositories_table.table.headers.settings') },
    { label: '' }
  ])

  return {
    emit,
    filter,
    items,
    deleteRepository,
    tableColumns
  }
}

