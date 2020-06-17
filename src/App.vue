<template>
  <v-app>
    <the-header/>

    <v-main>
      <v-container fluid>
        <router-view v-if="renderRouterView"/>
        <loading v-else/>
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
  import esAdapter from '@/mixins/GetAdapter'
  import Loading from '@/components/shared/Loading'

  export default {
    name: 'App',
    components: {
      TheHeader,
      TheFooter,
      Loading,
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
        esAdapter()
          .catch(() => {
          })
          .finally(() => {
            this.renderRouterView = true
          })
      }
    }
  }
</script>
