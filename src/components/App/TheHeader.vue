<template>
  <v-toolbar :dense="this.$vuetify.breakpoint.sm">
    <router-link to="/" class="mt-2">
      <img v-if="this.$store.state.theme.dark" src="../../../public/images/logo/logo_48_white.png" alt="Logo">
      <img v-else src="../../../public/images/logo/logo_48_blue.png" alt="Logo">
    </router-link>
    <v-toolbar-title class="mr-4 ml-3 hidden-xs-only">
      <router-link to="/">
        Elasticvue
      </router-link>
    </v-toolbar-title>

    <test-and-connect-toolbar v-if="wasConnected" class="hidden-md-and-down" @hostChanged="$emit('hostChanged')"/>
    <v-spacer/>

    <v-toolbar-items>
      <v-btn id="navbar_home" flat to="/" exact>Home</v-btn>
      <v-btn id="navbar_nodes" flat to="/nodes">Nodes</v-btn>
      <v-btn id="navbar_indices" flat to="/indices">Indices</v-btn>
      <v-btn id="navbar_search" flat to="/search">Search</v-btn>
      <v-btn id="navbar_query" flat to="/query">Query</v-btn>
      <v-btn id="navbar_utilities" flat to="/utilities">Utilities</v-btn>
      <v-btn flat class="hidden-sm-and-down" href="https://github.com/cars10/elasticvue" target="_blank">
        <img v-if="this.$store.state.theme.dark" src="../../../public/images/github/GitHub-Mark-Light.png"
             alt="GithubIcon">
        <img v-else src="../../../public/images/github/GitHub-Mark.png" alt="GithubIcon">
      </v-btn>
    </v-toolbar-items>
  </v-toolbar>
</template>

<script>
  import TestAndConnectToolbar from '@/components/Setup/TestAndConnectToolbar'
  import ConnectionStatus from '@/mixins/ConnectionStatus'

  export default {
    name: 'app-header',
    components: {
      TestAndConnectToolbar
    },
    mixins: [
      ConnectionStatus
    ],
    data () {
      return {
        drawer: false
      }
    }
  }
</script>
