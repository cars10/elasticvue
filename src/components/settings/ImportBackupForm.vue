<template>
  <q-form @submit="importBackupAndRedirect">
    <q-file v-model="importFile"
            accept="application/json"
            :label="t('settings.import_export.import.select_file')"
            max-files="1"
            outlined
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
           :label="t('settings.import_export.import.import')" />
  </q-form>
</template>

<script setup lang="ts">
  import { useImportExport } from '../../composables/ImportExport'
  import { useTranslation } from '../../composables/i18n'
  import { handleError } from '../../helpers/error.ts'

  const t = useTranslation()
  const props = defineProps({
    confirmImport: {
      type: Boolean,
      default: true
    }
  })

  const { importFile, importBackup } = useImportExport({ confirmImport: props.confirmImport })

  const importBackupAndRedirect = async () => {
    try {
      const imported = await importBackup()
      if (imported) window.location.replace('/')
    } catch (e) {
      handleError(e, true)
    }
  }
</script>