<template>
  <q-dialog v-model="dialog" transition-duration="100">
    <q-card style="width: 520px; max-width: 90vw">
      <q-card-section class="row items-center no-wrap">
        <h2 class="text-h6 q-my-none col">{{ t('welcome.import_backup.heading') }}</h2>
        <q-btn v-close-popup icon="close" flat round dense :aria-label="t('defaults.close')" />
      </q-card-section>

      <q-separator />

      <q-card-section class="q-py-lg">
        <import-backup-form :confirm-import="false" />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import ImportBackupForm from '../settings/ImportBackupForm.vue'
import { useTranslation } from '../../composables/i18n.ts'

const dialog = defineModel<boolean>({ required: true })
const t = useTranslation()
</script>
