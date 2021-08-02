<template>
  <v-card class="mt-4">
    <v-card-title>Import/Export elasticvue data</v-card-title>

    <v-divider/>

    <v-card-text>
      <p>
        You can import & export your elasticvue data as json.
        This is <strong>not</strong> a backup of your clusters data, use snapshots if you need to backup your indices.
      </p>

      <v-row>
        <v-col cols="12" md="6" sm="12">
          <h5 class="text-h6 mb-4">Export</h5>
          <div class="mb-4">
            <v-btn class="pl-1" small text @click="helpCollapsed = !helpCollapsed">
              <v-icon>{{ helpCollapsed ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
              Whats included?
            </v-btn>

            <v-expand-transition>
              <div v-if="helpCollapsed" class="my-2 pa-2 lowered">
                <ul>
                  <li>Saved clusters (including username and password <strong>in plain text</strong>)</li>
                  <li>Currently active cluster</li>
                  <li>Code Editor settings</li>
                  <li>Search settings</li>
                  <li>Theme</li>
                  <li>Rest query history and current query</li>
                  <li>Table filters & options</li>
                </ul>
              </div>
            </v-expand-transition>
          </div>

          <v-btn @click="createBackup" class="primary-button mr-2">
            Prepare backup
          </v-btn>
          <v-btn :href="backupDownloadLink" :download="downloadFilename" class="primary-button"
                 :disabled="backupDownloadLink.length === 0">
            Download
          </v-btn>

          <v-divider class="my-6"/>

          <h5 class="text-h6">Import</h5>
          <v-form @submit.prevent="importBackupAndRedirect">
            <v-file-input v-model="importFile"
                          show-size
                          truncate-length="30"
                          accept="application/json"
                          placeholder="Select file..."/>
            <p class="red--text">{{ errorMessage }}</p>
            <v-btn color="primary-button" type="submit" :disabled="!valid">Import settings</v-btn>
          </v-form>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
  import { ref } from '@vue/composition-api'
  import { exportStoreDataUri, useImportFileData } from '@/helpers/import_export'
  import { BASE_URI } from '@/consts'

  export default {
    name: 'import-export-settings',
    setup () {
      const helpCollapsed = ref(false)
      const importFile = ref(null)
      const backupDownloadLink = ref('')
      const createBackup = () => {
        backupDownloadLink.value = ''
        exportStoreDataUri().then(link => {
          backupDownloadLink.value = link
        })
      }
      /* eslint-disable no-undef */
      const downloadFilename = `elasticvue_${VERSION}.json`

      const { valid, errorMessage, importBackup } = useImportFileData(importFile)
      const importBackupAndRedirect = () => {
        importBackup().then(imported => {
          if (imported) window.location.replace(BASE_URI)
        })
      }

      return {
        helpCollapsed,
        valid,
        backupDownloadLink,
        createBackup,
        downloadFilename,
        importFile,
        errorMessage,
        importBackupAndRedirect
      }
    }
  }
</script>
