<template>
  <q-btn color="primary-dark" :label="t('welcome.import_backup.heading')" icon="upload" @click="dialog = true" />

  <q-dialog v-model="dialog" position="top" transition-show="scale" transition-hide="scale" transition-duration="100">
    <q-card style="width: 500px" class="q-mt-xl">
      <q-card-section class="flex justify-between">
        <h2 class="text-h5 q-my-none">{{ t('welcome.import_backup.heading') }}</h2>
        <q-btn v-close-popup icon="close" flat round dense />
      </q-card-section>

      <q-separator />

      <q-card-section>
        <import-backup-form :confirm-import="false" />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import ImportBackupForm from '../settings/ImportBackupForm.vue'
  import { useTranslation } from '../../composables/i18n.ts'

  const dialog = ref(false)
  const t = useTranslation()
</script>