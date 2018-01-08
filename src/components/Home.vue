<template>
  <div v-if="this.$store.state.connection.elasticsearchClient" class="width-100">
    <h1>Indices</h1>
    <indices></indices>
  </div>

  <div class="p3" md-column v-else>
    <connect></connect>
  </div>
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
