<template>
  <span class="identifier">{{identifier}}</span>
</template>

<script>
  export default {
    props: {
      identifier: {
        type: String,
        default: '-'
      }
    }
  }
</script>
