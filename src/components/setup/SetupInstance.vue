<template>
  <q-btn color="primary-dark" icon="add" label="Add elasticsearch cluster" @click="dialog = true" />

  <q-dialog v-model="dialog" position="top" transition-show="scale" transition-hide="scale">
    <q-card style="width: 1000px;max-width: 1000px" class="q-mt-xl">
      <q-card-section class="flex justify-between">
        <h2 class="text-h5 q-my-none">Add cluster</h2>
        <q-btn v-close-popup icon="close" flat round dense />
      </q-card-section>

      <q-separator />

      <template v-if="SHOW_CORS_HINT">
        <q-card-section>
          <h2 class="text-h6">
            {{ $t('setup.configure.heading') }}
          </h2>
          <configure-help />
        </q-card-section>

        <q-separator />
      </template>

      <q-card-section>
        <h2 v-if="SHOW_CORS_HINT" class="text-h6 q-mb-md">
          {{ $t('setup.test_and_connect.heading') }}
        </h2>
        <add-instance />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
  import AddInstance from './AddInstance.vue'
  import { SHOW_CORS_HINT } from '../../consts'
  import ConfigureHelp from './ConfigureHelp.vue'
  import { ref } from 'vue'

  const dialog = ref(false)
</script>