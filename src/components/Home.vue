<template>
  <v-layout row wrap>
    <v-flex xs3 offset-xs3>
      <client-information></client-information>
    </v-flex>

    <v-flex xs3>
      <cluster-health></cluster-health>
    </v-flex>
  </v-layout>
</template>

<script>
  import ClientInformation from '@/components/Home/ClientInformation'
  import ClusterHealth from '@/components/Home/ClusterHealth'

  export default {
    components: {
      ClientInformation,
      ClusterHealth
    }
  }
</script>
