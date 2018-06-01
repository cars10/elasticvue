<template>
  <v-toolbar :dense="this.$vuetify.breakpoint.sm">
    <v-toolbar-title class="mr-4 hidden-xs-only">
      <router-link to="/">Elasticvue</router-link>
      {{this.$vuetify.breakpoint.name}}
    </v-toolbar-title>

    <test-and-connect-toolbar class="hidden-md-and-down" v-if="isConnected"
                              v-on:hostChanged="$emit('hostChanged')"></test-and-connect-toolbar>
    <v-spacer></v-spacer>

    <v-toolbar-items>
      <v-btn flat to="/" exact>Home</v-btn>
      <v-btn flat to="/indices">Indices</v-btn>
      <v-btn flat to="/browse">Browse</v-btn>
      <v-btn flat to="/query">Query</v-btn>
      <v-btn flat to="/utilities">Utilities</v-btn>
      <v-btn flat class="hidden-sm-and-down" href="https://github.com/cars10/elasticvue" target="_blank">
        <img src="../../../static/GitHub-Mark-Light.png" alt="GithubIcon" v-if="this.$store.state.theme.dark">
        <img src="../../../static/GitHub-Mark.png" alt="GithubIcon" v-else>
      </v-btn>
    </v-toolbar-items>
  </v-toolbar>
</template>

<script>
  import TestAndConnectToolbar from '@/components/Setup/TestAndConnectToolbar'
  import IsConnected from '../../mixins/IsConnected'

  export default {
    name: 'app-header',
    data () {
      return {
        drawer: false
      }
    },
    components: {
      TestAndConnectToolbar
    },
    mixins: [
      IsConnected
    ]
  }
</script>
