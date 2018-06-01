<template>
  <v-app v-bind="this.$store.state.theme">
    <app-header v-on:hostChanged="rerender"></app-header>

    <v-content>
      <v-container grid-list-md>
        <content-or-setup>
          <router-view v-if="renderRouterView"></router-view>
        </content-or-setup>
      </v-container>
      <snackbar></snackbar>
    </v-content>

    <app-footer></app-footer>
  </v-app>
</template>

<script>
  import AppHeader from '@/components/App/AppHeader'
  import AppFooter from '@/components/App/AppFooter'
  import ContentOrSetup from '@/components/ContentOrSetup'
  import Snackbar from '@/components/Snackbar'

  export default {
    name: 'App',
    data () {
      return {
        renderRouterView: true
      }
    },
    methods: {
      rerender () {
        this.renderRouterView = false
        this.$store.commit('resetBrowse')
        this.$store.commit('resetConnection')
        this.$nextTick(() => (this.renderRouterView = true))
      }
    },
    components: {
      AppHeader,
      AppFooter,
      ContentOrSetup,
      Snackbar
    }
  }
</script>
