<template>
  <div :class="classes">
    <slot></slot>
  </div>
</template>

<style>
  .btn-group > .btn {
    margin: 0;
  }

  .btn-group__small {
    height: 36px;
    display: inline-flex;
  }

  .btn-group__small > .btn {
    min-width: 32px;
  }
</style>

<script>
  export default {
    props: {
      small: Boolean
    },
    computed: {
      classes () {
        return [
          'elevation-1',
          'btn-group',
          {'btn-group__small': this.small}
        ]
      }
    }
  }
</script>
