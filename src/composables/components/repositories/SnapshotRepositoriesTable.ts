import { useTranslation } from '../../i18n'
import { computed } from 'vue'
import { filterItems } from '../../../helpers/filters'
import { genColumns } from '../../../helpers/tableColumns'
import { setupFilterState } from '../shared/FilterState.ts'
import { useSnapshotRepositoriesStore } from '../../../store/snapshot_repositories.ts'
import type { RepositoryRow } from '../../../types/snapshots.ts'

export type SnapshotRepositoriesTableProps = {
  repositories: RepositoryRow[]
  slm: boolean
}

export const useSnapshotRepositoriesTable = (props: SnapshotRepositoriesTableProps) => {
  const t = useTranslation()
  const snapshotRepositoriesStore = useSnapshotRepositoriesStore()

  const results = computed(() => props.repositories)
  const filteredResults = computed(() =>
    filterItems(results.value, snapshotRepositoriesStore.filter, ['name', 'type', 'location'])
  )

  const filterStateProps = setupFilterState(results, filteredResults)

  const columns = genColumns([
    { label: t('repositories.repositories_table.table.headers.name'), field: 'name' },
    { label: t('repositories.repositories_table.table.headers.location'), field: 'location' },
    props.slm ? { label: t('repositories.repositories_table.table.headers.policies') } : null,
    { label: '' }
  ])

  return {
    filteredResults,
    filterStateProps,
    columns
  }
}
