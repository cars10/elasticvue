<template>
  <v-app v-bind="this.$store.state.theme">
    <the-header @hostChanged="rerender"></the-header>

    <v-content>
      <v-container grid-list-md>
        <content-or-setup>
          <router-view v-if="renderRouterView"></router-view>
        </content-or-setup>
      </v-container>
      <snackbar></snackbar>
    </v-content>

    <the-footer></the-footer>
  </v-app>
</template>

<script>
  import TheHeader from '@/components/App/TheHeader'
  import TheFooter from '@/components/App/TheFooter'
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
        this.$store.commit('resetSearch')
        this.$store.commit('resetConnection')
        this.$nextTick(() => (this.renderRouterView = true))
      }
    },
    components: {
      TheHeader,
      TheFooter,
      ContentOrSetup,
      Snackbar
    }
  }
</script>
