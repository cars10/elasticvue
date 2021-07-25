<template>
  <v-row>
    <v-col lg="8" offset-lg="2">
      <v-card>
        <v-card-title>
          <h1 class="text-h5">{{ $t("settings.title") }}</h1>
        </v-card-title>
        <v-divider/>

        <v-card-text>
          <v-row>
            <v-col cols="12" md="6" sm="12">
              <change-theme class="mb-8"/>

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
        </v-card-text>
      </v-card>

      <import-export-settings/>
    </v-col>
  </v-row>
</template>

<script>
  import ImportExportSettings from '@/components/Settings/ImportExportSettings'
  import ChangeTheme from '@/components/shared/ChangeTheme'
  import { vuexAccessors } from '@/helpers/store'
  import { DEFAULT_HIDE_INDICES_REGEX } from '@/consts'
  import store from '@/store'

  export default {
    name: 'settings',
    components: {
      ChangeTheme,
      ImportExportSettings
    },
    setup () {
      const { hideIndicesRegex } = vuexAccessors('indices', ['hideIndicesRegex'])
      const resetHideIndicesRegex = () => store.commit('indices/resetHideIndicesRegex')
      return {
        hideIndicesRegex,
        DEFAULT_HIDE_INDICES_REGEX,
        resetHideIndicesRegex
      }
    }
  }
</script>
