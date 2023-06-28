<template>
  <q-card class="q-mt-lg">
    <q-card-section>
      <h2 class="text-h5 q-my-none">
        {{ t('settings.import_export.heading') }}
      </h2>
    </q-card-section>

    <q-separator />

    <q-card-section>
      <!-- eslint-disable-next-line vue/no-v-html -->
      <p v-html="t('settings.import_export.message')" />

      <h3 class="text-h6">
        {{ t('settings.import_export.export.heading') }}
      </h3>

      <download-button color="primary-dark"
                       class="q-mb-md"
                       :download="downloadFileName"
                       :label="t('settings.import_export.export.download')"
                       :generate-download-data="backupJsonString" />

      <div>
        <q-btn flat @click="helpCollapsed = !helpCollapsed">
          <q-icon :name="helpCollapsed ? 'expand_less' : 'expand_more'" />
          {{ t('settings.import_export.export.included') }}
        </q-btn>

        <q-slide-transition>
          <div v-if="helpCollapsed">
            <ul>
              <li>Saved clusters (including username and password <strong>in plain text</strong>)</li>
              <li>Currently active cluster</li>
              <li>Code Editor settings</li>
              <li>Search settings</li>
              <li>Theme</li>
              <li>Language</li>
              <li>Rest query history</li>
            </ul>
          </div>
        </q-slide-transition>
      </div>
    </q-card-section>

    <q-separator />

    <q-card-section>
      <h3 class="text-h6">
        {{ t('settings.import_export.import.heading') }}
      </h3>

      <div class="row">
        <div class="col-md-6 col-sm-12">
          <import-backup-form :confirm-import="true" />
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import DownloadButton from '../shared/DownloadButton.vue'
  import { useImportExport } from '../../composables/ImportExport'
  import ImportBackupForm from './ImportBackupForm.vue'
  import { useTranslation } from '../../composables/i18n'

  const t = useTranslation()
  const { downloadFileName, backupJsonString } = useImportExport()
  const helpCollapsed = ref(false)
</script>