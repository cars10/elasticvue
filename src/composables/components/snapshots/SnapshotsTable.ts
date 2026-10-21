import { useTranslation } from '../../i18n.ts'
import { computed } from 'vue'
import { genColumns } from '../../../helpers/tableColumns.ts'
import { filterItems } from '../../../helpers/filters.ts'
import { setupFilterState } from '../shared/FilterState.ts'
import { useSnapshotsStore } from '../../../store/snapshots.ts'
import type { SnapshotRow } from '../../../types/snapshots.ts'

export type SnapshotsTableProps = {
  repository: string
  snapshots: SnapshotRow[]
}

export const useSnapshotsTable = (props: SnapshotsTableProps) => {
  const t = useTranslation()
  const snapshotsStore = useSnapshotsStore()

  const results = computed(() => props.snapshots)
  const filteredResults = computed(() => filterItems(results.value, snapshotsStore.filter, ['name', 'state']))

  const filterStateProps = setupFilterState(results, filteredResults)

  const columns = genColumns([
    { label: t('snapshots.snapshots_table.table.headers.snapshot'), field: 'name' },
    { label: t('snapshots.snapshots_table.table.headers.state'), field: 'state' },
    { label: t('snapshots.snapshots_table.table.headers.started'), field: 'startTime' },
    { label: t('snapshots.snapshots_table.table.headers.end_time'), field: 'endTime' },
    { label: t('snapshots.snapshots_table.table.headers.duration'), field: 'durationMs', align: 'right' },
    { label: t('snapshots.snapshots_table.table.headers.shards'), align: 'right' },
    { label: '' }
  ])

  return {
    filteredResults,
    filterStateProps,
    columns
  }
}
