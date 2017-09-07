<template>
  <span class="nested_object--object-key">{{object_key}}:</span>
</template>

<script>
  export default {
    props: ['object_key']
  }
</script>

<style scoped>
  .nested_object--object-key {
    vertical-align: top;
  }
</style>
