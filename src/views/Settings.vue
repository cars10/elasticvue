<template>
  <v-row>
    <v-col lg="8" offset-lg="2">
      <v-card>
        <v-card-title>
          <h1 class="text-h5">{{ $t('settings.heading') }}</h1>
        </v-card-title>
        <v-divider/>

        <v-card-text>
          <v-row class="mb-4">
            <v-col cols="12" md="6" sm="12">
              <v-text-field id="query"
                            v-model="hideIndicesRegex"
                            :label="$t('settings.hide_indices_regex.label')"
                            :messages="$t('settings.hide_indices_regex.message')"
                            autofocus>
                <template v-slot:message="{ message }">
                  <span v-html="message"/>
                </template>
                <template v-slot:append>
                  <v-btn :title="$t('settings.hide_indices_regex.reset', {regex: DEFAULT_HIDE_INDICES_REGEX})"
                         icon
                         @click="resetHideIndicesRegex">
                    <v-icon>mdi-backup-restore</v-icon>
                  </v-btn>
                </template>
              </v-text-field>
            </v-col>
          </v-row>

          <v-divider class="mb-4"/>

          <p>{{ $t('settings.disconnect_and_reset.heading') }}</p>
          <v-btn small type="button" @click="reset">
            <v-icon class="red--text mr-2" small>mdi-alert</v-icon>
            {{ $t('settings.disconnect_and_reset.button') }}
          </v-btn>
        </v-card-text>
      </v-card>

      <import-export/>
    </v-col>
  </v-row>
</template>

<script>
  import ImportExport from '@/components/Settings/ImportExport'
  import { vuexAccessors } from '@/helpers/store'
  import { BASE_URI, DEFAULT_HIDE_INDICES_REGEX, LOCALSTORAGE_KEY } from '@/consts'
  import store from '@/store'
  import i18n from '@/i18n'
  import { askConfirm } from '@/services/tauri/dialogs'

  export default {
    name: 'settings',
    components: {
      ImportExport
    },
    setup () {
      const { hideIndicesRegex } = vuexAccessors('indices', ['hideIndicesRegex'])
      const resetHideIndicesRegex = () => store.commit('indices/resetHideIndicesRegex')

      const reset = async () => {
        const confirmed = await askConfirm(i18n.t('settings.disconnect_and_reset.confirm'))
        if (!confirmed) return

        window.indexedDB.databases().then(databases => {
          databases.forEach(db => window.indexedDB.deleteDatabase(db.name))
        })

        localStorage.removeItem(LOCALSTORAGE_KEY)
        sessionStorage.removeItem(LOCALSTORAGE_KEY)
        window.location.replace(BASE_URI)
      }

      return {
        hideIndicesRegex,
        DEFAULT_HIDE_INDICES_REGEX,
        resetHideIndicesRegex,
        reset
      }
    }
  }
</script>
