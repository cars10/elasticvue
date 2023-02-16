<template>
  <q-btn color="primary-dark" label="Import elasticvue backup" icon="upload" @click="dialog = true" />

  <q-dialog v-model="dialog" position="top" transition-show="scale" transition-hide="scale">
    <q-card style="width: 500px" class="q-mt-xl">
      <q-card-section class="flex justify-between">
        <h2 class="text-h5 q-my-none">Import backup</h2>
        <q-btn v-close-popup icon="close" flat round dense />
      </q-card-section>

      <q-separator />

      <q-card-section>
        <import-backup-form :confirm-import="false" />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
  import { ref } from 'vue'
  import ImportBackupForm from '../settings/ImportBackupForm.vue'

  const dialog = ref(false)
</script>