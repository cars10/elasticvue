<template>
  <v-app v-bind="this.$store.state.theme">
    <the-header @hostChanged="rerender"/>

    <v-content>
      <v-container fluid grid-list-md>
        <content-or-setup>
          <router-view v-if="renderRouterView"/>
        </content-or-setup>
      </v-container>
      <snackbar/>
    </v-content>

    <the-footer/>
  </v-app>
</template>

<script>
  import TheHeader from '@/components/App/TheHeader'
  import TheFooter from '@/components/App/TheFooter'
  import ContentOrSetup from '@/components/ContentOrSetup'
  import Snackbar from '@/components/Snackbar'
  import ConnectionStatus from '@/mixins/ConnectionStatus'
  import ConnectWithServer from '@/mixins/ConnectWithServer'

  export default {
    name: 'App',
    components: {
      TheHeader,
      TheFooter,
      ContentOrSetup,
      Snackbar
    },
    mixins: [
      ConnectionStatus,
      ConnectWithServer
    ],
    data () {
      return {
        renderRouterView: true
      }
    },
    created () {
      if (this.wasConnected) {
        this.connectWithServer()
      }
    },
    methods: {
      rerender () {
        this.renderRouterView = false
        this.$store.commit('search/reset')
        this.$nextTick(() => (this.renderRouterView = true))
      }
    }
  }
</script>
