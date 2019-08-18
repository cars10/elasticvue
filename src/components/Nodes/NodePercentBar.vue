<template>
  <v-progress-linear :class="classes" :color="color" :height="height" :value="value"/>
</template>

<script>
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
    computed: {
      color () {
        let numberValue = parseFloat(this.value)
        if (numberValue >= 90) {
          return 'error'
        } else if (numberValue < 90 && numberValue >= 80) {
          return 'warning'
        } else {
          return 'primary'
        }
      }
    }
  }
</script>
