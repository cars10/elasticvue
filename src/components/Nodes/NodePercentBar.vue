<template>
  <v-progress-linear :class="classes" :color="color" :height="height" :value="value"/>
</template>

<script>
  import { computed } from '@vue/composition-api'

  export default {
    name: 'node-percent-bar',
    props: {
      value: {
        type: [String, Number],
        default: 0
      },
      height: {
        type: [String, Number],
        default: 4
      },
      classes: {
        type: String,
        default: 'my-0'
      }
    },
    setup (props) {
      const color = computed(() => {
        const numberValue = parseFloat(props.value)
        if (numberValue >= 90) {
          return 'red'
        } else if (numberValue < 90 && numberValue >= 80) {
          return 'orange'
        } else {
          return 'blue'
        }
      })

      return {
        color
      }
    }
  }
</script>
