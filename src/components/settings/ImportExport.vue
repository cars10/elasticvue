<template>
  <q-card class="q-mt-lg">
    <q-card-section>
      <h2 class="text-h5 q-my-none">
        {{ $t('settings.import_export.heading') }}
      </h2>
    </q-card-section>

    <q-separator />

    <q-card-section>
      <!-- eslint-disable-next-line vue/no-v-html -->
      <p v-html="$t('settings.import_export.message')" />

      <h3 class="text-h6">
        {{ $t('settings.import_export.export.heading') }}
      </h3>

      <download-button color="primary-dark"
                       class="q-mb-md"
                       :download="downloadFileName"
                       :label="$t('settings.import_export.export.download')"
                       :generate-download-data="backupJsonString" />

      <div>
        <q-btn flat @click="helpCollapsed = !helpCollapsed">
          <q-icon :name="helpCollapsed ? 'expand_less' : 'expand_more'" />
          {{ $t('settings.import_export.export.included') }}
        </q-btn>

        <q-slide-transition>
          <div v-if="helpCollapsed">
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
        </q-slide-transition>
      </div>
    </q-card-section>

    <q-separator />

    <q-card-section>
      <h3 class="text-h6">
        {{ $t('settings.import_export.import.heading') }}
      </h3>

      <div class="row">
        <div class="col-6">
          <q-form @submit="importBackupAndRedirect">
            <q-file v-model="importFile"
                    accept="application/json"
                    :label="$t('settings.import_export.import.select_file')"
                    max-files="1"
                    class="q-mb-md">
              <template #prepend>
                <q-icon name="attach_file" />
              </template>

              <template #append>
                <q-btn v-if="importFile !== null" flat round
                       icon="close"
                       class="cursor-pointer"
                       @click.stop.prevent="importFile = null" />
              </template>
            </q-file>

            <q-btn :disable="!importFile"
                   color="primary-dark"
                   icon="upload"
                   type="submit"
                   :label="$t('settings.import_export.import.import')" />
          </q-form>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
  import { ref } from 'vue'
  import DownloadButton from '../shared/DownloadButton.vue'
  import { useImportExport } from '../../composables/ImportExport'

  const { backupJsonString, importFile, importBackup } = useImportExport()
  const helpCollapsed = ref(false)
  const downloadFileName = `elasticvue_${__APP_VERSION__}_backup.json`

  const importBackupAndRedirect = async () => {
    const imported = await importBackup()
    if (imported) window.location.replace('/')
  }
</script>