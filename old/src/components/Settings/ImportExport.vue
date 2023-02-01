<template>
  <v-card class="mt-4">
    <v-card-title>{{ $t('settings.import_export.heading') }}</v-card-title>

    <v-divider/>

    <v-card-text>
      <p v-html="$t('settings.import_export.message')"></p>

      <v-row>
        <v-col cols="12" md="6" sm="12">
          <h5 class="text-h6 mb-4">{{ $t('settings.import_export.export.heading') }}</h5>
          <div class="mb-4">
            <v-btn class="pl-1" small text @click="helpCollapsed = !helpCollapsed">
              <v-icon>{{ helpCollapsed ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
              {{ $t('settings.import_export.export.included') }}
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

          <v-btn class="primary-button mr-2" @click="createBackup">
            {{ $t('settings.import_export.export.prepare_backup') }}
          </v-btn>
          <download-button class="d-inline-block"
                           :download="downloadFileName"
                           :disabled="!data"
                           :text="$t('settings.import_export.export.download')"
                           :generateDownloadData="generateDownloadData"/>

          <v-divider class="my-6"/>

          <h5 class="text-h6">{{ $t('settings.import_export.import.heading') }}</h5>
          <v-form @submit.prevent="importBackupAndRedirect">
            <v-file-input v-model="importFile"
                          :placeholder="$t('settings.import_export.import.select_file')"
                          accept="application/json"
                          show-size
                          truncate-length="30"/>
            <p class="red--text">{{ errorMessage }}</p>
            <v-btn :disabled="!valid" color="primary-button" type="submit">
              {{ $t('settings.import_export.import.import') }}
            </v-btn>
          </v-form>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
  import { ref } from 'vue'
  import { exportStoreDataUri, useImportFileData } from '@/helpers/import_export'
  import DownloadButton from '@/components/shared/DownloadButton'
  import { BASE_URI } from '@/consts'

  export default {
    name: 'import-export-settings',
    components: {
      DownloadButton
    },
    setup () {
      const helpCollapsed = ref(false)
      const importFile = ref(null)
      const data = ref(undefined)

      const createBackup = () => {
        data.value = undefined
        exportStoreDataUri().then(d => (data.value = d))
      }
      const generateDownloadData = () => (data.value)
      /* eslint-disable no-undef */
      const downloadFileName = `elasticvue_${VERSION}.json`

      const { valid, errorMessage, importBackup } = useImportFileData(importFile)
      const importBackupAndRedirect = () => {
        importBackup().then(imported => {
          if (imported) window.location.replace(BASE_URI)
        })
      }
      const fileChooserDialog = ref(false)
      const setFile = file => (importFile.value = file)

      return {
        helpCollapsed,
        valid,
        generateDownloadData,
        createBackup,
        downloadFileName,
        importFile,
        errorMessage,
        importBackupAndRedirect,
        data,
        fileChooserDialog,
        setFile
      }
    }
  }
</script>
