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

  export default {
    name: 'App',
    components: {
      TheHeader,
      TheFooter,
      ContentOrSetup,
      Snackbar
    },
    data () {
      return {
        renderRouterView: true
      }
    },
    methods: {
      rerender () {
        this.renderRouterView = false
        this.$store.commit('search/reset')
        this.$store.commit('connection/resetConnection')
        this.$nextTick(() => (this.renderRouterView = true))
      }
    }
  }
</script>
