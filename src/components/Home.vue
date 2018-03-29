<template>
    <content-or-connect>
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
    </content-or-connect>
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
