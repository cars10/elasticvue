import { genColumns } from '../../../helpers/tableColumns.ts'
import { useTranslation } from '../../i18n.ts'
import { computed } from 'vue'
import { useShardRecoveryStore } from '../../../store/shardRecovery.ts'

export type ShardRecovery = {
  index: string
  shard: number
  primary: boolean
  total_time_in_millis: number
  start_time_in_millis: number
  stop_time_in_millis: number
  type: string
  stage: string
  source_host: string
  source_node: string
  target_host: string
  target_node: string
  files_recovered: number
  files_percent: string
  files_total: number
  bytes_recovered: number
  bytes_percent: string
  bytes_total: number
  translog_ops: number
  translog_ops_recovered: number
  translog_ops_percent: string
}

export type IndexRecovery = Record<string, {
  shards: Array<{
    id: number
    type: string
    stage: string
    primary: boolean
    start_time_in_millis: number
    stop_time_in_millis: number
    total_time_in_millis: number
    source: {
      id: string
      host: string
      transport_address: string
      ip: string
      name: string
    }
    target: {
      id: string
      host: string
      transport_address: string
      ip: string
      name: string
    }
    index: {
      size: {
        total_in_bytes: number
        reused_in_bytes: number
        recovered_in_bytes: number
        recovered_from_snapshot_in_bytes: number
        percent: string
      }
      files: {
        total: number
        reused: number
        recovered: number
        percent: string
      }
      total_time_in_millis: number
      source_throttle_time_in_millis: number
      target_throttle_time_in_millis: number
    }
    translog: {
      recovered: number
      total: number
      percent: string
      total_on_start: number
      total_time_in_millis: number
    }
    verify_index: {
      check_index_time_in_millis: number
      total_time_in_millis: number
    }
  }>
}>

export type ShardRecoveryTableProps = {
  shardRecoveries: IndexRecovery
}

export const useShardRecoveryTable = (props: ShardRecoveryTableProps) => {
  const t = useTranslation()
  const shardRecoveryStore = useShardRecoveryStore()

  const filteredShards = computed(() => {
    const results = transformRecoveryResponse(props.shardRecoveries)
    if (shardRecoveryStore.filter.length === 0) return results

    return results.filter(shard => shard.index.includes(shardRecoveryStore.filter))
  })

  function transformRecoveryResponse (input: IndexRecovery): ShardRecovery[] {
    const results: ShardRecovery[] = []

    for (const [index, data] of Object.entries(input)) {
      for (const shard of data.shards) {
        results.push({
          index,
          shard: shard.id,
          primary: shard.primary,
          total_time_in_millis: shard.total_time_in_millis,
          start_time_in_millis: shard.start_time_in_millis,
          stop_time_in_millis: shard.stop_time_in_millis,
          type: shard.type.toLowerCase(),
          stage: shard.stage.toLowerCase(),
          source_host: shard.source.host,
          source_node: shard.source.name,
          target_host: shard.target.host,
          target_node: shard.target.name,
          files_recovered: shard.index.files.recovered,
          files_percent: shard.index.files.percent,
          files_total: shard.index.files.total,
          bytes_recovered: shard.index.size.recovered_in_bytes,
          bytes_percent: shard.index.size.percent,
          bytes_total: shard.index.size.total_in_bytes,
          translog_ops: shard.translog.total,
          translog_ops_recovered: shard.translog.recovered,
          translog_ops_percent: shard.translog.percent
        })
      }
    }

    return results
  }

  const columns = genColumns([
    { label: t('shard_recovery_table.columns.index'), field: 'index' },
    { label: t('shard_recovery_table.columns.stage'), field: 'stage' },
    { label: t('shard_recovery_table.columns.source') },
    { label: t('shard_recovery_table.columns.target') },
    { label: t('shard_recovery_table.columns.time'), field: 'start_time_in_millis' },
    { label: t('shard_recovery_table.columns.duration'), field: 'time' },
    { label: t('shard_recovery_table.columns.files') },
    { label: t('shard_recovery_table.columns.bytes') },
    { label: t('shard_recovery_table.columns.translog_ops') },
  ])

  return {
    filteredShards,
    columns
  }
}