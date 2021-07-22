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
                            append-icon="mdi-close"
                            autofocus
                            :label="$t('settings.hide-indices-regex')"
                            :messages="$t('settings.hide-indices-regex-message')">
                <template v-slot:message="{ message }">
                  <span v-html="message"/>
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
  import ImportExportSettings from '@/components/Utilities/ImportExportSettings'
  import ChangeTheme from '@/components/shared/ChangeTheme'
  import { vuexAccessors } from '@/helpers/store'

  export default {
    name: 'settings',
    components: {
      ChangeTheme,
      ImportExportSettings
    },
    setup () {
      const { hideIndicesRegex } = vuexAccessors('indices', ['hideIndicesRegex'])
      return {
        hideIndicesRegex
      }
    }
  }
</script>
