<template>
  <v-app v-bind="this.$store.state.theme">
    <the-header/>

    <v-content>
      <v-container fluid grid-list-md>
        <router-view v-if="renderRouterView"/>
        <loading v-else/>

        <modal-data-loader v-model="modalOpen"
                           :method-params="methodParams"
                           :method="method"
                           :modal-title="title"
                           :modal-subtitle="subtitle"/>
      </v-container>
      <snackbar/>
    </v-content>

    <the-footer/>
  </v-app>
</template>

<script>
  import TheHeader from '@/components/App/TheHeader'
  import TheFooter from '@/components/App/TheFooter'
  import Snackbar from '@/components/Snackbar'
  import ConnectionStatus from '@/mixins/ConnectionStatus'
  import { getCachedAdapter } from '@/mixins/GetAdapter'
  import ModalDataLoader from '@/components/shared/ModalDataLoader'
  import Loading from '@/components/shared/Loading'
  import { mapVuexAccessors } from './helpers/store'

  export default {
    name: 'App',
    components: {
      TheHeader,
      TheFooter,
      ModalDataLoader,
      Loading,
      Snackbar
    },
    mixins: [ConnectionStatus],
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
        getCachedAdapter()
          .catch(() => {
          })
          .finally(() => {
            this.renderRouterView = true
          })
      }
    }
  }
</script>
