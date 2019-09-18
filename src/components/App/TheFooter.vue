<template>
  <v-footer>
    <v-row>
      <v-col cols="4">
        <v-switch id="theme_select" v-model="dark" color="primary" class="mt-0 mb-2 pt-0" hide-details label="Dark theme"/>
        <a id="resetSettings" title="Disconnect and reset saved settings" @click="reset">Disconnect and reset</a>
      </v-col>

      <v-col class="text-center" cols="4">
        <div class="subtitle-1">Elasticvue {{version}}</div>
        &copy;{{ new Date().getFullYear()}} - Carsten K&ouml;nig<br>
      </v-col>

      <v-col cols="4">
        <div class="text-right">
          <a href="https://github.com/cars10/elasticvue" rel="nofollow" target="_blank">Github</a><br>
          <a href="https://elasticvue.com" rel="nofollow" target="_blank">Homepage</a>
        </div>
      </v-col>
    </v-row>
  </v-footer>
</template>

<script>
  import { BASE_URI, LOCALSTORAGE_KEY } from '@/consts'

  export default {
    name: 'app-footer',
    computed: {
      version () {
        /* eslint-disable no-undef */
        return VERSION
      },
      dark: {
        get () {
          return this.$store.state.theme.dark
        },
        set (val) {
          this.$vuetify.theme.dark = val
          this.$store.commit('theme/setDark', val)
        }
      }
    },
    methods: {
      reset () {
        localStorage.removeItem(LOCALSTORAGE_KEY)
        window.location.replace(BASE_URI)
      }
    }
  }
</script>
