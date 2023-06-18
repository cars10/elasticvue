import { useTranslation } from '../../i18n'
import { computed, ref } from 'vue'
import { filterItems } from '../../../helpers/filters'
import { defineElasticsearchRequest } from '../../CallElasticsearch'
import { genColumns } from '../../../helpers/tableColumns'

export type EsSnapshotRepository = {
  type: string,
  uuid: string,
  settings: EsSnapshotRepositorySettings
}

type EsSnapshotRepositorySettings = {
  location: string,
  maxRestoreBytesPerSec: string,
  chunkSize: string,
  readonly: string,
  compress: string
}

export type SnapshotRepositoriesTableProps = {
  repositories: Record<string, EsSnapshotRepository>
}

export const useSnapshotRepositoriesTable = (props: SnapshotRepositoriesTableProps, emit: any) => {
  const t = useTranslation()

  const filter = ref('')
  const items = computed(() => {
    if (Object.keys(props.repositories).length === 0) return []
    const repos = Object.entries(props.repositories).map(([name, repo]) => Object.assign({}, { name }, repo))
    return filterItems(repos, filter.value, ['name'])
  })

  const { run } = defineElasticsearchRequest({ emit, method: 'snapshotDeleteRepository' })
  const deleteRepository = (name: string) => {
    return run({
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

