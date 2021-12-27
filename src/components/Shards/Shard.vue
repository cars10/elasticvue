<template>
  <v-chip @click="action(shard)"
          small
          label
          class="px-2"
          style="border-width:2px;"
          outlined
          :class="classes">
    {{ shard.prirep }}{{ shard.shard }}
  </v-chip>
</template>

<script>
  import { computed } from '@vue/composition-api'

  export default {
    name: 'shard',
    props: {
      shard: {
        type: Object,
        default: () => ({})
      },
      action: {
        type: Function,
        default: () => {
        }
      }
    },
    setup (props) {
      const replica = props.shard.prirep === 'r'

      const classes = computed(() => {
        const newClasses = []
        if (replica) newClasses.push('outline--dashed')

        if (props.shard.state === 'STARTED') {
          newClasses.push('success')
        } else if (['INITIALIZING', 'RELOCATING'].includes(props.shard.state)) {
          newClasses.push('warning')
        }

        return newClasses
      })

      return {
        classes
      }
    }
  }
</script>
