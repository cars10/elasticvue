<template>
  <v-footer height="auto">
    <v-layout row wrap pa-4>
      <v-flex xs4>
        <v-switch id="theme_select" v-model="dark" class="mt-0 mb-2 pt-0" label="Dark theme" hide-details/>
        <a id="resetSettings" title="Disconnect and reset saved settings" @click="reset">Disconnect and reset</a>
      </v-flex>

      <v-flex xs4 text-xs-center>
        <div class="subheading">Elasticvue {{version}}</div>
        &copy;{{ new Date().getFullYear()}} - Carsten K&ouml;nig<br>
      </v-flex>

      <v-flex xs4>
        <v-flex text-xs-right>
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
