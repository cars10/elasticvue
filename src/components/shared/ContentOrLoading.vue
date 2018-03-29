<template>
  <div>
    <v-progress-linear v-if="loading" color="blue" indeterminate></v-progress-linear>
    <slot v-else></slot>
  </div>
</template>

<script>
  export default {
    props: ['loading']
  }
</script>
