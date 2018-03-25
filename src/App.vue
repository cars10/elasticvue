<template>
  <v-app>
    <v-toolbar>
      <v-toolbar-title>
        <router-link to="/">Elasticvue</router-link>
      </v-toolbar-title>

      <v-chip color="green">{{this.connectionStateName}}</v-chip>

      <connect></connect>

      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn flat to="/" exact>Home</v-btn>
        <v-btn flat to="indices" exact>Indices</v-btn>
        <v-btn flat to="/browse" exact>Browse</v-btn>
      </v-toolbar-items>
    </v-toolbar>


    <v-content>
      <v-container>
        <router-view></router-view>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
  import Connect from '@/components/Connect'
  import ConnectMixin from './mixins/ConnectMixin'
  import { CONNECTION_STATE_NAMES, LOCALSTORAGE_KEY } from './consts'

  export default {
    components: {
      Connect
    },
    mixins: [ConnectMixin],
    created () {
      // We want to automatically connect if the user was connected before.
      // We naively check by checking if something was saved to localStorage already.
      if (localStorage.getItem(LOCALSTORAGE_KEY)) {
        this.connectWithClient()
      }
    },
    computed: {
      connectionStateName () {
        return CONNECTION_STATE_NAMES[this.$store.state.connection.status]
      }
    }
  }
</script>
