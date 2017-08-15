<template>
  <indices v-if="this.$store.state.elasticsearchClient"></indices>

  <md-layout md-align="center" v-else>
    <connect></connect>
  </md-layout>
</template>

<script>
  import Indices from '@/components/Home/Indices'
  import Connect from '@/components/Connect'

  export default {
    components: {
      Indices,
      Connect
    }
  }
</script>
