<template>
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
            <img src="../../../static/GitHub_Logo_White.png" alt="GithubLogo" v-if="this.$store.state.theme.dark">
            <img src="../../../static/GitHub_Logo.png" alt="GithubLogo" v-else>
          </a>
        </v-flex>
      </v-flex>
    </v-layout>
  </v-footer>
</template>

<script>
  export default {
    name: 'app-footer',
    computed: {
      version () {
        /* eslint-disable no-undef */
        return `v${VERSION}`
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
      }
    }
  }
</script>
