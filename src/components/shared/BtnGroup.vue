<template>
  <div :class="classes">
    <slot/>
  </div>
</template>

<script>
  import { computed } from '@vue/composition-api'

  export default {
    name: 'BtnGroup',
    props: {
      small: {
        default: false,
        type: Boolean
      }
    },
    setup (props) {
      const classes = computed(() => {
        return [
          'elevation-1',
          'btn-group',
          { 'btn-group--small': props.small }
        ]
      })

      return {
        classes
      }
    }
  }
</script>
