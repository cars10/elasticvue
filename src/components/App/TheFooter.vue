<template>
  <v-footer class="pa-4">
    <v-row>
      <v-col cols="4">
        <change-theme/>
        <button class="btn-link" type="button" @click="reset">Disconnect and reset</button>
      </v-col>

      <v-col class="text-center" cols="4">
        <div class="text-subtitle-1">
          Elasticvue {{ version }} |
          <a href="https://github.com/cars10/elasticvue/blob/master/CHANGELOG.md" rel="nofollow" target="_blank">
            Changelog</a> |
          <a href="https://elasticvue.com/survey" target="_blank" class="font-weight-bold">Survey</a>
        </div>
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
  import ChangeTheme from '@/components/shared/ChangeTheme'

  export default {
    name: 'app-footer',
    components: {
      ChangeTheme
    },
    setup () {
      const reset = async () => {
        localStorage.removeItem(LOCALSTORAGE_KEY)
        window.indexedDB.databases().then(databases => {
          databases.forEach(db => window.indexedDB.deleteDatabase(db.name))
        })
        window.location.replace(BASE_URI)
      }

      return {
        /* eslint-disable no-undef */
        version: VERSION,
        reset
      }
    }
  }
</script>
