<template>
  <settings-section :title="t('settings.import_export.heading')">
    <template #description>
      <!-- eslint-disable-next-line vue/no-v-html -->
      <span v-html="t('settings.import_export.message')" />
    </template>

    <settings-row :label="t('settings.import_export.export.heading')">
      <template #description>
        <i18n-t scope="global" keypath="settings.import_export.export.contents" tag="span">
          <template #credentials>
            <strong>{{ t('settings.import_export.export.credentials') }}</strong>
          </template>
        </i18n-t>
      </template>
      <download-button
        outline
        color="primary"
        :download="downloadFileName"
        :label="t('settings.import_export.export.download')"
        :generate-download-data="backupJsonString"
      />
    </settings-row>

    <settings-row :label="t('settings.import_export.import.heading')">
      <import-backup-form :confirm-import="true" class="full-width" />
    </settings-row>
  </settings-section>
</template>

<script setup lang="ts">
import DownloadButton from '../shared/DownloadButton.vue'
import { useImportExport } from '../../composables/ImportExport'
import ImportBackupForm from './ImportBackupForm.vue'
import SettingsSection from './SettingsSection.vue'
import SettingsRow from './SettingsRow.vue'
import { useTranslation } from '../../composables/i18n'

const t = useTranslation()
const { downloadFileName, backupJsonString } = useImportExport()
</script>
