<template>
  <q-chip :title="JSON.stringify(shard, null, '\t')"
          :clickable="reRoutable"
          dense
          square :label="`${shard.prirep}${shard.shard}`"
          style="border-width:2px;"
          :outline="outlined"
          :color="outlined ? '' : 'positive'"
          :class="classes"
          @click="reRoutable ? action(shard) : null" />
</template>

<script setup>
  import { computed } from 'vue'

  const props = defineProps({
    shard: {
      type: Object,
      default: () => ({})
    },
    action: {
      type: Function,
      default: () => {
      }
    },
    reRoutable: {
      type: Boolean,
      default: false
    },
    outlined: {
      type: Boolean,
      default: true
    }
  })

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
