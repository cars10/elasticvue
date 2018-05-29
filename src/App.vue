<template>
  <v-app v-bind="this.$store.state.theme">
    <v-toolbar>
      <v-toolbar-title class="mr-5">
        <router-link to="/">Elasticvue</router-link>
      </v-toolbar-title>

      <v-chip :color="connectionStateClass">{{connectionStateName}}</v-chip>

      <v-spacer></v-spacer>
      <connect isToolbar v-if="isConnected()" v-on:hostChanged="rerender"></connect>
      <v-spacer></v-spacer>

      <v-toolbar-items>
        <v-btn flat to="/" exact>Home</v-btn>
        <v-btn flat to="/indices">Indices</v-btn>
        <v-btn flat to="/browse">Browse</v-btn>
        <v-btn flat to="/query">Query</v-btn>
        <v-btn flat to="/utilities">Utilities</v-btn>
        <v-btn flat href="https://github.com/cars10/elasticvue" target="_blank">
          <img src="../static/GitHub-Mark-Light.png" alt="GithubIcon" v-if="this.$store.state.theme.dark">
          <img src="../static/GitHub-Mark.png" alt="GithubIcon" v-else>
        </v-btn>
      </v-toolbar-items>
    </v-toolbar>

    <v-content>
      <v-container grid-list-md>
        <content-or-connect>
          <router-view v-if="renderRouterView"></router-view>
        </content-or-connect>
      </v-container>
      <snackbar></snackbar>
    </v-content>

    <v-footer height="auto">
      <v-layout row wrap py-3 px-3>
        <v-flex xs4 align-center d-inline-flex>
          <v-switch label="Dark theme" v-model="theme"></v-switch>
        </v-flex>

        <v-flex xs4 text-xs-center>
          {{version}} - &copy; {{ new Date().getFullYear()}}<br/>
          <v-btn @click="reset" title="Reset saved settings">Reset</v-btn>
        </v-flex>

        <v-flex xs4 text-xs-right align-center d-inline-flex>
          <v-flex>
            <a href="https://github.com/cars10/elasticvue" target="_blank" rel="nofollow">
              <img src="../static/GitHub_Logo_White.png" alt="GithubLogo" v-if="this.$store.state.theme.dark">
              <img src="../static/GitHub_Logo.png" alt="GithubLogo" v-else>
            </a>
          </v-flex>
        </v-flex>
      </v-layout>
    </v-footer>
  </v-app>
</template>

<script>
  import Connect from '@/components/shared/Connect'
  import ContentOrConnect from '@/components/shared/ContentOrConnect'
  import { CONNECTION_STATE_CLASSES, CONNECTION_STATE_NAMES } from './consts'
  import Snackbar from '@/components/Snackbar'

  export default {
    name: 'App',
    data () {
      return {
        renderRouterView: true
      }
    },
    computed: {
      version () {
        /* eslint-disable no-undef */
        return `v${VERSION}`
      },
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
      reset () {
        localStorage.clear()
        window.location.replace('/')
      },
      rerender () {
        this.renderRouterView = false
        this.$store.commit('resetBrowse')
        this.$store.commit('resetConnection')
        this.$nextTick(() => (this.renderRouterView = true))
      }
    },
    components: {
      Connect,
      ContentOrConnect,
      Snackbar
    }
  }
</script>
