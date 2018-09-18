<template>
  <div :class="classes">
    <slot/>
  </div>
</template>

<script>
  export default {
    name: 'BtnGroup',
    props: {
      small: {
        default: false,
        type: Boolean
      }
    },
    computed: {
      classes () {
        return [
          'elevation-1',
          'btn-group',
          { 'btn-group--small': this.small }
        ]
      }
    }
  }
</script>
