<template>
  <v-toolbar>
    <v-toolbar-title class="mr-5">
      <router-link to="/">Elasticvue</router-link>
    </v-toolbar-title>

    <test-and-connect-toolbar v-if="isConnected" v-on:hostChanged="$emit('hostChanged')"></test-and-connect-toolbar>
    <v-spacer></v-spacer>

    <v-toolbar-items>
      <v-btn flat to="/" exact>Home</v-btn>
      <v-btn flat to="/indices">Indices</v-btn>
      <v-btn flat to="/browse">Browse</v-btn>
      <v-btn flat to="/query">Query</v-btn>
      <v-btn flat to="/utilities">Utilities</v-btn>
      <v-btn flat href="https://github.com/cars10/elasticvue" target="_blank">
        <img src="../../../static/GitHub-Mark-Light.png" alt="GithubIcon" v-if="this.$store.state.theme.dark">
        <img src="../../../static/GitHub-Mark.png" alt="GithubIcon" v-else>
      </v-btn>
    </v-toolbar-items>
  </v-toolbar>
</template>

<script>
  import { CONNECTION_STATE_CLASSES, CONNECTION_STATE_NAMES } from '../../consts'
  import TestAndConnectToolbar from '@/components/Setup/TestAndConnectToolbar'
  import IsConnected from '../../mixins/IsConnected'

  export default {
    name: 'app-header',
    computed: {
      connectionStateName () {
        return CONNECTION_STATE_NAMES[this.$store.state.connection.status]
      },
      connectionStateClass () {
        return CONNECTION_STATE_CLASSES[this.$store.state.connection.status]
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
