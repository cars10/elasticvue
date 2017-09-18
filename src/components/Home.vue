<template>
  <div v-if="this.$store.state.connection.elasticsearchClient" class="width-100">
    <h1>Indices</h1>
    <indices></indices>
  </div>

  <md-layout class="p3" md-column v-else>
    <md-layout md-align="center">
      <connect></connect>
    </md-layout>
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
