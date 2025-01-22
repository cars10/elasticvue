import { useTranslation } from '../../i18n.ts'
import { computed, ref } from 'vue'
import { genColumns } from '../../../helpers/tableColumns.ts'
import { EsSnapshot } from './SnapshotRow.ts'
import { filterItems } from '../../../helpers/filters.ts'
import { setupFilterState } from '../shared/FilterState.ts'

export type SnapshotsTableProps = {
  repository: string,
  snapshots: EsSnapshot[]
}

export const useSnapshotsTable = (props: SnapshotsTableProps) => {
  const t = useTranslation()
  const filter = ref('')

  const results = computed(() => props.snapshots)
  const filteredResults = computed(() => {
    return filterItems(results.value, filter.value, ['snapshot'])
  })

  const filterStateProps = setupFilterState(results, filteredResults)

  const columns = genColumns([
    { label: 'id' },
    { label: t('snapshots.snapshots_table.table.headers.status'), field: 'state' },
    { label: t('snapshots.snapshots_table.table.headers.start_time') },
    { label: t('snapshots.snapshots_table.table.headers.end_time') },
    { label: t('snapshots.snapshots_table.table.headers.duration') },
    { label: t('snapshots.snapshots_table.table.headers.indices') },
    { label: t('snapshots.snapshots_table.table.headers.successful_shards') },
    { label: t('snapshots.snapshots_table.table.headers.failed_shards') },
    { label: t('snapshots.snapshots_table.table.headers.total_shards') },
    { label: '' }
  ])

  return {
    filter,
    filteredResults,
    filterStateProps,
    columns
  }
}