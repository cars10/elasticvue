<template>
  <settings-section icon="import_export" :title="t('settings.import_export.heading')">
    <q-card-section>
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div v-html="t('settings.import_export.message')" />
    </q-card-section>

    <q-card-section>
      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-6">
          <h3 class="text-subtitle1 text-weight-medium q-mt-none q-mb-sm">
            {{ t('settings.import_export.export.heading') }}
          </h3>
          <div class="text-muted font-13 q-mb-sm">{{ t('settings.import_export.export.included') }}</div>
          <ul class="text-muted font-13 q-mt-none q-pl-md">
            <li>Saved clusters (including username and password <strong>in plain text</strong>)</li>
            <li>Currently active cluster</li>
            <li>Code Editor settings</li>
            <li>Search settings</li>
            <li>Theme</li>
            <li>Language</li>
            <li>Rest query history</li>
          </ul>
          <download-button
            color="primary-dark"
            :download="downloadFileName"
            :label="t('settings.import_export.export.download')"
            :generate-download-data="backupJsonString"
          />
        </div>

        <div class="col-12 col-md-6">
          <h3 class="text-subtitle1 text-weight-medium q-mt-none q-mb-sm">
            {{ t('settings.import_export.import.heading') }}
          </h3>
          <import-backup-form :confirm-import="true" />
        </div>
      </div>
    </q-card-section>
  </settings-section>
</template>

<script setup lang="ts">
import DownloadButton from '../shared/DownloadButton.vue'
import { useImportExport } from '../../composables/ImportExport'
import ImportBackupForm from './ImportBackupForm.vue'
import SettingsSection from './SettingsSection.vue'
import { useTranslation } from '../../composables/i18n'

const t = useTranslation()
const { downloadFileName, backupJsonString } = useImportExport()
</script>
