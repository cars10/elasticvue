<template>
  <tr>
    <td>
      <strong>{{ shardRecovery.index }}</strong> <br>
      Shard {{ shardRecovery.shard }}, {{ shardRecovery.primary ? 'pri' : 'rep' }} <br>
      <span class="text-muted">Type: {{ shardRecovery.type }}</span>
    </td>
    <td>
      <span v-if="shardRecovery.stage === 'DONE'">{{ shardRecovery.stage }}</span>
      <span v-else class="text-warning">{{ shardRecovery.stage }}</span>
    </td>
    <td>
      <div class="flex column">
        <div>{{ shardRecovery.source_node || 'N/A' }}</div>
        <div class="text-muted">{{ shardRecovery.source_host || 'N/A' }}</div>
      </div>
    </td>
    <td>
      <div class="flex column">
        <div>{{ shardRecovery.target_node || 'N/A' }}</div>
        <div class="text-muted">{{ shardRecovery.target_host || 'N/A' }}</div>
      </div>
    </td>
    <td>
      {{ new Date(shardRecovery.start_time_in_millis).toLocaleString() }} - <br>
      {{ new Date(shardRecovery.stop_time_in_millis).toLocaleString() }}
    </td>
    <td>{{ formatTime(shardRecovery.total_time_in_millis) }}</td>
    <td>
      {{ shardRecovery.files_percent }} ({{ shardRecovery.files_recovered }} / {{ shardRecovery.files_total }})
    </td>
    <td>
      {{ shardRecovery.bytes_percent }}
      ({{ prettyPrintByteString(shardRecovery.bytes_recovered) }} /
      {{ prettyPrintByteString(shardRecovery.bytes_total) }})
    </td>
    <td>
      {{ shardRecovery.translog_ops_percent }} ({{ shardRecovery.translog_ops_recovered }} /
      {{ shardRecovery.translog_ops }})
    </td>
  </tr>
</template>

<script setup lang="ts">
  import { ShardRecovery } from '../../composables/components/shardrecovery/ShardRecoveryTable.ts'
  import { prettyPrintByteString } from '../../helpers/bytes.ts'
  import { formatTime } from '../../helpers/time.ts'

  type ShardRecoveryRowProps = { shardRecovery: ShardRecovery }
  defineProps<ShardRecoveryRowProps>()
</script>