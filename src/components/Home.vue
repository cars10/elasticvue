<template>
  <div v-if="this.$store.state.connection.elasticsearchClient" class="width-100">
    <v-container grid-list-md text-xs-center>
      <v-layout row wrap>
        <v-flex xs3 offset-xs3>
          <client-information></client-information>
        </v-flex>

        <v-flex xs3>
          <cluster-health></cluster-health>
        </v-flex>
      </v-layout>
    </v-container>
  </div>

  <div class="p3" md-column v-else>
    <connect></connect>
  </div>
</template>

<script>
  import ClientInformation from '@/components/Home/ClientInformation'
  import ClusterHealth from '@/components/Home/ClusterHealth'
  import Connect from '@/components/Connect'

  export default {
    components: {
      ClientInformation,
      ClusterHealth,
      Connect
    }
  }
</script>
