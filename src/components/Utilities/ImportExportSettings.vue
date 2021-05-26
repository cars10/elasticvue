<template>
  <v-card class="mt-4">
    <v-card-title>
      <v-badge content="Beta" title="This is a beta feature and might not work as expected." color="orange">
        Import & export settings
      </v-badge>
    </v-card-title>
    <v-divider/>
    <v-card-text>
      <p class="white--text">
        You can import & export your elasticvue settings as json.
        This is <strong>not</strong> a backup of your clusters data, use snapshots if you need to backup your indices.
      </p>

      <v-row>
        <v-col cols="12" md="6" sm="12">
          <v-subheader>Import</v-subheader>
          <v-divider></v-divider>
          <div class="mt-4">
            <v-form @submit.prevent="importBackup">
              <v-row>
                <v-col cols="12" md="6" sm="12">
                  <v-file-input v-model="importFile"
                                show-size
                                accept="application/json"
                                placeholder="Select file..."/>
                  <p class="red--text">{{ errorMessage }}</p>
                </v-col>
              </v-row>
              <v-btn color="primary" type="submit" :disabled="!valid">Upload settings</v-btn>
            </v-form>
          </div>
        </v-col>

        <v-col cols="12" md="6" sm="12">
          <v-subheader>Export</v-subheader>
          <v-divider></v-divider>
          <div class="mt-4">
            <v-btn :href="storeDataUri" :download="downloadFilename" color="primary">
              Download settings
            </v-btn>

            <div class="pt-2">
              <v-btn class="pl-1" small text @click="helpCollapsed = !helpCollapsed">
                <v-icon>{{ helpCollapsed ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
                Whats included?
              </v-btn>
            </div>

            <v-expand-transition>
              <div v-if="helpCollapsed" class="my-2 pa-2 lowered">
                <ul class="white--text">
                  <li>Saved clusters (including username and password <strong>in plain text</strong>)</li>
                  <li>Currently active cluster</li>
                  <li>Code Editor settings</li>
                  <li>Theme</li>
                  <li>Rest query url+body</li>
                  <li>Table filters & options</li>
                </ul>
              </div>
            </v-expand-transition>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
  import { ref } from '@vue/composition-api'
  import { BASE_URI, LOCALSTORAGE_KEY } from '@/consts'
  import { exportStoreDataUri, useImportFileData } from '@/helpers/import_export'

  export default {
    name: 'import-export-settings',
    setup () {
      const helpCollapsed = ref(false)
      const importFile = ref(null)
      const storeDataUri = exportStoreDataUri()
      /* eslint-disable no-undef */
      const downloadFilename = `elasticvue_${VERSION}.json`

      const { valid, errorMessage, importedData } = useImportFileData(importFile)

      const importBackup = () => {
        if (!valid.value || !importedData) return

        if (confirm('Are you sure? Importing a backup will overwrite your current settings and saved clusters!')) {
          localStorage.setItem(LOCALSTORAGE_KEY, importedData.value)
          window.location.replace(BASE_URI)
        }
      }

      return {
        helpCollapsed,
        valid,
        storeDataUri,
        downloadFilename,
        importFile,
        errorMessage,
        importBackup
      }
    }
  }
</script>
