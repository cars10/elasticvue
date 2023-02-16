<template>
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
</template>

<script setup>
  import { useImportExport } from '../../composables/ImportExport'
  import { useSnackbar } from '../../composables/Snackbar'

  const props = defineProps({
    confirmImport: {
      type: Boolean,
      default: true
    }
  })

  const { showErrorSnackbar } = useSnackbar()

  const { importFile, importBackup } = useImportExport({ confirmImport: props.confirmImport })

  const importBackupAndRedirect = () => {
    importBackup().then(imported => {
      if (imported) window.location.replace('/')
    }).catch(e => {
      showErrorSnackbar({ title: 'Error', body: e })
    })
  }
</script>