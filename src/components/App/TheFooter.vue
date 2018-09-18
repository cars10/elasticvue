<template>
  <v-footer height="auto">
    <v-layout row wrap pa-4>
      <v-flex xs4>
        <div class="subheading">Settings</div>
        <v-switch id="theme_select" v-model="dark" class="my-2" label="Dark theme" hide-details/>
        <a id="resetSettings" title="Reset saved settings" @click="reset">Disconnect and reset</a>
      </v-flex>

      <v-flex xs4 text-xs-center>
        <div class="subheading">Elasticvue {{version}}</div>
        &copy;{{ new Date().getFullYear()}} - Carsten K&ouml;nig<br>
      </v-flex>

      <v-flex xs4>
        <v-flex text-xs-right>
          <div class="subheading mb-2">Links</div>
          <a href="https://elasticvue.com" target="_blank" rel="nofollow">Homepage</a><br>
          <a href="https://github.com/cars10/elasticvue" target="_blank" rel="nofollow">Github</a>
        </v-flex>
      </v-flex>
    </v-layout>
  </v-footer>
</template>

<script>
  import { mapVuexAccessors } from '../../helpers/store'
  import { LOCALSTORAGE_KEY } from '../../consts'

  export default {
    name: 'app-footer',
    computed: {
      version () {
        /* eslint-disable no-undef */
        return VERSION
      },
      ...mapVuexAccessors('theme', ['dark'])
    },
    methods: {
      reset () {
        localStorage.removeItem(LOCALSTORAGE_KEY)
        window.location.replace('/')
      }
    }
  }
</script>
