<template>
  <span v-if="typeof object_value === 'string' " :class="'nested_object__value--' + typeof object_value">"{{object_value}}"</span>
  <span v-else :class="'nested_object__value--' + typeof object_value">{{object_value}}</span>
</template>

<script>
  export default {
    props: ['object_value']
  }
</script>

<style scoped>
  .nested_object__value--string {
    color: green;
  }

  .nested_object__value--number {
    color: red;
  }

  .nested_object__value--object {
    color: purple
  }

  .nested_object__value--boolean {
    color: blue;
  }

  .nested_object__value--undefined {
    color: grey;
  }
</style>
