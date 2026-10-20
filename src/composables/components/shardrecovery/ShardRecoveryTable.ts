import { genColumns } from '../../../helpers/tableColumns.ts'
import { useTranslation } from '../../i18n.ts'
import { computed } from 'vue'
import { useShardRecoveryStore } from '../../../store/shardRecovery.ts'
import { setupFilterState } from '../shared/FilterState.ts'
import { filterItems } from '../../../helpers/filters.ts'
import type { ShardRecovery } from '../../../types/shardRecovery.ts'

export type ShardRecoveryTableProps = {
  recoveries: ShardRecovery[]
}

export const useShardRecoveryTable = (props: ShardRecoveryTableProps) => {
  const t = useTranslation()
  const shardRecoveryStore = useShardRecoveryStore()

  const results = computed(() => props.recoveries)
  const filteredResults = computed(() => {
    let items = results.value
    if (shardRecoveryStore.activeOnly) items = items.filter((r) => r.active)
    if (shardRecoveryStore.stage) items = items.filter((r) => r.stage === shardRecoveryStore.stage)

    return filterItems(items, shardRecoveryStore.filter, ['index', 'sourceNode', 'targetNode'])
  })

  const stageOptions = computed(() => [...new Set(results.value.map((r) => r.stage))].sort())

  const filterStateProps = setupFilterState(results, filteredResults)

  const columns = genColumns([
    { label: t('shard_recovery_table.columns.index'), field: 'index' },
    { label: t('shard_recovery_table.columns.type'), field: 'type' },
    { label: t('shard_recovery_table.columns.stage'), field: 'stage' },
    { label: t('shard_recovery_table.columns.source_target') },
    { label: t('shard_recovery_table.columns.bytes'), field: 'bytesPercent' },
    { label: t('shard_recovery_table.columns.files'), field: 'filesPercent' },
    { label: t('shard_recovery_table.columns.translog_ops'), field: 'translogPercent' },
    { label: t('shard_recovery_table.columns.duration'), field: 'durationMs', align: 'right' },
    { label: t('shard_recovery_table.columns.time'), field: 'startTime' },
    { label: t('shard_recovery_table.columns.throttle'), field: 'throttleMs', align: 'right' }
  ])

  return {
    filterStateProps,
    filteredResults,
    stageOptions,
    columns
  }
}
