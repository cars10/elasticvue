<template>
  <tr>
    <td>
      {{ shardRecovery.index }} <br>
      Shard: {{ shardRecovery.shard }} <br>
      <span class="text-muted">{{ shardRecovery.type }}</span>
    </td>
    <td>
      <span v-if="shardRecovery.stage === 'done'">{{ shardRecovery.stage }}</span>
      <span v-else class="text-warning">{{ shardRecovery.stage }}</span>
    </td>
    <td>
      <div class="flex row">
        <div class="flex column">
          <div>{{ shardRecovery.source_node }}</div>
          <div class="text-muted">{{ shardRecovery.source_host }}</div>
        </div>

        <div class="flex q-px-md items-center">
          <q-icon name="arrow_forward" size="sm" />
        </div>

        <div class="flex column">
          <div>{{ shardRecovery.target_node }}</div>
          <div class="text-muted">{{ shardRecovery.target_host }}</div>
        </div>
      </div>
    </td>
    <td>{{ shardRecovery.time }}</td>
    <td>
      {{ shardRecovery.files_percent }} ({{ shardRecovery.files_recovered }} / {{ shardRecovery.files_total }})
    </td>
    <td>
      {{ shardRecovery.bytes_percent }} ({{ shardRecovery.bytes_recovered }} / {{ shardRecovery.bytes_total }})
    </td>
    <td>
      {{ shardRecovery.translog_ops_percent }} ({{ shardRecovery.translog_ops_recovered }} /
      {{ shardRecovery.translog_ops }})
    </td>
  </tr>
</template>

<script setup lang="ts">
  import { ShardRecovery } from './ShardRecoveryTable.vue'

  type ShardRecoveryRowProps = {
    shardRecovery: ShardRecovery
  }
  defineProps<ShardRecoveryRowProps>()
</script>