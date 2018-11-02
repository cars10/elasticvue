<template>
  <v-app v-bind="this.$store.state.theme">
    <the-header @hostChanged="rerender"/>

    <v-content>
      <v-container fluid grid-list-md>
        <content-or-setup>
          <router-view v-if="renderRouterView"/>

          <modal-data-loader v-model="modalOpen"
                             :method-params="methodParams"
                             :method="method"
                             :modal-title="title"
                             :modal-subtitle="subtitle"/>
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
  import ModalDataLoader from '@/components/shared/ModalDataLoader'
  import { mapVuexAccessors } from './helpers/store'

  export default {
    name: 'App',
    components: {
      TheHeader,
      TheFooter,
      ContentOrSetup,
      ModalDataLoader,
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
    computed: {
      ...mapVuexAccessors('modal', ['modalOpen', 'method', 'methodParams', 'title', 'subtitle'])
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
