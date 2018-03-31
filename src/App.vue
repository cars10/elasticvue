<template>
  <v-app v-bind="this.$store.state.theme">
    <v-toolbar>
      <v-toolbar-title class="mr-5">
        <router-link to="/">Elasticvue</router-link>
      </v-toolbar-title>

      <v-chip :color="connectionStateClass">{{connectionStateName}}</v-chip>

      <v-spacer></v-spacer>
      <connect :useToolbar="true" v-if="isConnected()"></connect>
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

    <v-footer height="auto">
      <v-layout row wrap py-3 px-3>
        <v-flex xs4>
          <v-switch label="Dark theme" v-model="theme" hide-details></v-switch>
        </v-flex>

        <v-flex xs4 text-xs-center>
          &copy;{{ new Date().getFullYear()}}
        </v-flex>

        <v-flex xs4 text-xs-right>
          <a href="https://github.com/cars10/elasticvue" target="_blank" rel="nofollow">Github</a>
        </v-flex>
        <v-flex text-xs-center>
          <v-btn v-on:click="resetLocalStorage()">Reset</v-btn>
        </v-flex>
      </v-layout>
    </v-footer>
  </v-app>
</template>

<script>
  import Connect from '@/components/shared/Connect'
  import { CONNECTION_STATE_CLASSES, CONNECTION_STATE_NAMES } from './consts'

  export default {
    components: {
      Connect
    },
    computed: {
      connectionStateName () {
        return CONNECTION_STATE_NAMES[this.$store.state.connection.status]
      },
      connectionStateClass () {
        return CONNECTION_STATE_CLASSES[this.$store.state.connection.status]
      },
      theme: {
        get () {
          return this.$store.state.theme.dark
        },
        set (value) {
          this.$store.commit('setTheme', value)
        }
      }
    },
    methods: {
      resetLocalStorage () {
        localStorage.clear()
        window.location.replace('/')
      }
    }
  }
</script>
