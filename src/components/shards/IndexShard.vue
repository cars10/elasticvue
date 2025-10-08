<template>
  <q-chip
    :title="JSON.stringify(shard, null, '\t')"
    :clickable="reRoutable"
    dense
    square
    :label="`${shard.prirep}${shard.shard}`"
    style="border-width: 2px"
    :outline="outlined"
    :color="outlined ? '' : 'positive'"
    :class="classes"
    @click="reRoutable ? action(shard) : null"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { EsShard } from '../../helpers/shards.ts'

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

const replica = props.shard.prirep === 'r'

const classes = computed(() => {
  const newClasses = []
  if (replica) newClasses.push('outline--dashed')

  if (props.shard.state === 'STARTED') {
    newClasses.push('border-positive')
  } else if (['INITIALIZING', 'RELOCATING'].includes(props.shard.state)) {
    newClasses.push('border-warning')
  } else {
    newClasses.push('border-grey')
  }

  return newClasses
})
</script>
