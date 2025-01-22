import { useTranslation } from '../../i18n'
import { computed, ref } from 'vue'
import { filterItems } from '../../../helpers/filters'
import { defineElasticsearchRequest } from '../../CallElasticsearch'
import { genColumns } from '../../../helpers/tableColumns'
import { useRouter } from 'vue-router'
import { setupFilterState } from '../shared/FilterState.ts'

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

  const results = computed(() => Object.entries(props.repositories))
  const filteredResults = computed(() => {
    if (results.value.length === 0) return []
    const repos = results.value.map(([name, repo]) => Object.assign({}, { name }, repo))
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

  const router = useRouter()
  const openSnapshots = (repositoryName: string) => (router.push({ name: 'snapshots', params: { repositoryName } }))

  const filterStateProps = setupFilterState(results, filteredResults)

  const columns = genColumns([
    { label: t('repositories.repositories_table.table.headers.name'), field: 'name' },
    { label: t('repositories.repositories_table.table.headers.type'), field: 'type' },
    { label: t('repositories.repositories_table.table.headers.settings') },
    { label: '' }
  ])

  return {
    emit,
    openSnapshots,
    filter,
    filteredResults,
    filterStateProps,
    deleteRepository,
    columns
  }
}

