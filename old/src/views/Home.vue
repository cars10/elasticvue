<template>
  <v-row>
    <v-col lg="4" offset-lg="2">
      <client-information/>
    </v-col>

    <v-col lg="4">
      <cluster-health/>
    </v-col>
  </v-row>
</template>

<script>
  import ClientInformation from '@/components/Home/ClientInformation'
  import ClusterHealth from '@/components/Home/ClusterHealth'

  export default {
    name: 'home',
    components: {
      ClientInformation,
      ClusterHealth
    }
  }
</script>
