<template>
  <v-footer class="pa-4">
    <v-row>
      <v-col cols="4">
        <v-switch id="theme_select" v-model="dark" class="mt-0 mb-2 pt-0" color="primary-button" hide-details
                  label="Dark theme"/>
        <a id="resetSettings" href="javascript:void(0)" role="button" @click="reset">Disconnect and reset</a>
      </v-col>

      <v-col class="text-center" cols="4">
        <div class="text-subtitle-1">Elasticvue {{ version }} | <a
          href="https://github.com/cars10/elasticvue/blob/master/CHANGELOG.md" rel="nofollow"
          target="_blank">Changelog</a></div>
        &copy;{{ new Date().getFullYear() }} - Carsten K&ouml;nig<br>
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
  import { ref, watch } from '@vue/composition-api'
  import store from '@/store'

  export default {
    name: 'app-footer',
    setup (props, context) {
      const reset = () => {
        localStorage.removeItem(LOCALSTORAGE_KEY)
        window.location.replace(BASE_URI)
      }

      const dark = ref(context.root.$vuetify.theme.dark)
      watch(dark, newValue => {
        context.root.$vuetify.theme.dark = newValue
        store.commit('theme/setDark', newValue)
      })

      return {
        /* eslint-disable no-undef */
        version: VERSION,
        dark,
        reset
      }
    }
  }
</script>
