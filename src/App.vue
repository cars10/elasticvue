<template>
  <v-app>
    <the-header/>

    <v-main>
      <v-container fluid>
        <router-view v-if="renderRouterView"/>
        <v-progress-linear v-else color="blue" indeterminate/>
      </v-container>
      <snackbar/>
    </v-main>

    <the-footer/>
  </v-app>
</template>

<script>
  import TheHeader from '@/components/App/TheHeader'
  import TheFooter from '@/components/App/TheFooter'
  import Snackbar from '@/components/Snackbar'
  import ConnectionStatus from '@/mixins/ConnectionStatus'
  import { testAdapter } from '@/mixins/GetAdapter'

  export default {
    name: 'App',
    components: {
      TheHeader,
      TheFooter,
      Snackbar
    },
    mixins: [ConnectionStatus],
    data () {
      return {
        renderRouterView: true
      }
    },
    created () {
      if (this.wasConnected) {
        testAdapter()
          .catch(() => {
          })
          .finally(() => {
            this.renderRouterView = true
          })
      }
    }
  }
</script>
