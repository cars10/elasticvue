<template>
  <q-btn id="add_cluster" color="primary-dark" icon="add" :label="t('setup.setup_instance.heading')" @click="dialog = true" />

  <q-dialog v-model="dialog" position="top" transition-show="scale" transition-hide="scale" transition-duration="100">
    <q-card style="width: 1000px;max-width: 1000px" class="q-mt-xl">
      <q-card-section class="flex justify-between">
        <h2 class="text-h5 q-my-none">{{ t('setup.setup_instance.heading') }}</h2>
        <q-btn v-close-popup icon="close" flat round dense />
      </q-card-section>

      <q-separator />

      <template v-if="buildConfig.hints.cors">
        <q-card-section>
          <h2 class="text-h6">
            {{ t('setup.setup_instance.configure') }}
          </h2>
          <configure-help />
        </q-card-section>

        <q-separator />
      </template>

      <q-card-section>
        <h2 v-if="buildConfig.hints.cors" class="text-h6 q-mb-md">
          {{ t('setup.setup_instance.connect') }}
        </h2>
        <add-cluster />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
  import AddCluster from './AddCluster.vue'
  import ConfigureHelp from './ConfigureHelp.vue'
  import { ref } from 'vue'
  import { useTranslation } from '../../composables/i18n.ts'
  import { buildConfig } from '../../buildConfig.ts'

  const dialog = ref(false)
  const t = useTranslation()
</script>