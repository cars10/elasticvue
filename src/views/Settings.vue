<template>
  <v-row>
    <v-col lg="8" offset-lg="2">
      <v-card>
        <v-card-title>
          <h1 class="text-h5">{{ $t("settings.title") }}</h1>
        </v-card-title>
        <v-divider/>

        <v-card-text>
          <v-row class="mb-4">
            <v-col cols="12" md="6" sm="12">
              <v-text-field id="query"
                            v-model="hideIndicesRegex"
                            autofocus
                            :label="$t('settings.hide-indices-regex')"
                            :messages="$t('settings.hide-indices-regex-message')">
                <template v-slot:message="{ message }">
                  <span v-html="message"/>
                </template>
                <template v-slot:append class="mt-0">
                  <v-btn icon :title="'Reset to default ' + DEFAULT_HIDE_INDICES_REGEX" @click="resetHideIndicesRegex">
                    <v-icon>mdi-backup-restore</v-icon>
                  </v-btn>
                </template>
              </v-text-field>
            </v-col>
          </v-row>

          <v-divider class="mb-4"/>

          <p>{{ $t('settings.disconnect-and-reset-all-settings') }}</p>
          <v-btn type="button" small @click="reset">
            <v-icon small class="red--text mr-2">mdi-alert</v-icon>
            {{ $t('settings.disconnect-and-reset') }}
          </v-btn>
        </v-card-text>
      </v-card>

      <import-export-settings/>
    </v-col>
  </v-row>
</template>

<script>
  import ImportExportSettings from '@/components/Settings/ImportExportSettings'
  import { vuexAccessors } from '@/helpers/store'
  import { BASE_URI, DEFAULT_HIDE_INDICES_REGEX, LOCALSTORAGE_KEY } from '@/consts'
  import store from '@/store'

  export default {
    name: 'settings',
    components: {
      ImportExportSettings
    },
    setup () {
      const { hideIndicesRegex } = vuexAccessors('indices', ['hideIndicesRegex'])
      const resetHideIndicesRegex = () => store.commit('indices/resetHideIndicesRegex')

      const reset = () => {
        if (confirm('Are you sure? This will delete all data saved by elasticvue! You will have to reconnect to your cluster.')) {
          localStorage.removeItem(LOCALSTORAGE_KEY)
          window.indexedDB.databases().then(databases => {
            databases.forEach(db => window.indexedDB.deleteDatabase(db.name))
          })
          window.location.replace(BASE_URI)
        }
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
