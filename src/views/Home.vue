<template>
  <v-layout row wrap>
    <v-flex lg4 offset-lg2>
      <client-information/>
    </v-flex>

    <v-flex lg4>
      <cluster-health/>
    </v-flex>
  </v-layout>
</template>

<script>
  import ClientInformation from '@/components/Home/ClientInformation'
  import ClusterHealth from '@/components/Home/ClusterHealth'

  export default {
    name: 'Home',
    components: {
      ClientInformation,
      ClusterHealth
    }
  }
</script>
