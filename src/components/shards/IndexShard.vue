<template>
  <q-chip
    :clickable="reRoutable"
    dense
    square
    :label="`${shard.prirep}${shard.shard}`"
    style="border-width: 2px"
    :outline="outlined"
    :color="outlined ? '' : 'positive'"
    :class="classes"
    @click="reRoutable ? action(shard) : null"
  >
    <q-tooltip class="font-13">
      <div class="text-weight-bold">{{ shard.index }}</div>
      <div>{{ shard.prirep === 'p' ? 'primary' : 'replica' }} shard {{ shard.shard }}</div>
      <div>{{ shard.state }}</div>
      <div v-if="relocationTarget(shard)">{{ shardNodeName(shard) }} → {{ relocationTarget(shard) }}</div>
      <div v-if="shard.docs != null">{{ formatCount(toNumber(shard.docs)) }} docs</div>
      <div v-if="storeBytes != null">{{ prettyPrintByteString(storeBytes) }}</div>
      <div v-if="shard['unassigned.reason']">reason: {{ shard['unassigned.reason'] }}</div>
      <div v-if="reRoutable" class="q-mt-xs text-italic">Click to move this shard</div>
    </q-tooltip>
  </q-chip>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { EsShard, relocationTarget, shardNodeName, shardSeverity } from '../../helpers/shards.ts'
import { prettyPrintByteString } from '../../helpers/bytes.ts'
import { formatCount } from '../../helpers/nodes.ts'
import { toNumber } from '../../helpers/nodeStats.ts'

const props = withDefaults(
  defineProps<{
    shard: EsShard
    action?: (shard: EsShard) => void
    reRoutable?: boolean
    outlined?: boolean
  }>(),
  {
    action: () => {},
    reRoutable: false,
    outlined: true
  }
)

const storeBytes = computed(() => toNumber(props.shard.store))

const classes = computed(() => {
  const newClasses = []
  if (props.shard.prirep === 'r') newClasses.push('outline--dashed')

  const severity = shardSeverity(props.shard)
  if (severity === 'critical') newClasses.push('border-negative')
  else if (severity === 'warning' || severity === 'moving') newClasses.push('border-warning')
  else if (props.shard.state === 'STARTED') newClasses.push('border-positive')
  else newClasses.push('border-grey')

  return newClasses
})
</script>
