<template>
  <q-btn :label="t('cluster_selection.new_cluster.add_cluster')" color="primary-dark" @click="dialog = true" />

  <q-dialog v-model="dialog" transition-duration="100">
    <q-card style="min-width: 800px">
      <q-card-section class="flex justify-between">
        <h2 class="text-h6 q-my-none">{{ t('cluster_selection.new_cluster.heading') }}</h2>
        <q-btn v-close-popup icon="close" flat round dense />
      </q-card-section>

      <q-separator />

      <template v-if="buildConfig.hints.cors">
        <q-card-section>
          <h2 class="text-h6">
            {{ t('setup.configure.heading') }}
          </h2>
          <configure-help />
        </q-card-section>

        <q-separator />
      </template>

      <q-card-section>
        <h2 v-if="buildConfig.hints.cors" class="text-h6 q-mb-md">
          {{ t('setup.test_and_connect.heading') }}
        </h2>

        <add-cluster>
          <template #actions>
            <q-btn v-close-popup flat :label="t('defaults.cancel')" class="q-ml-sm" />
          </template>
        </add-cluster>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import AddCluster from '../setup/AddCluster.vue'
  import { useTranslation } from '../../composables/i18n.ts'
  import { buildConfig } from '../../buildConfig.ts'
  import ConfigureHelp from '../setup/ConfigureHelp.vue'

  const dialog = ref(false)
  const t = useTranslation()
</script>