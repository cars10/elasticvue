<template>
  <q-btn :label="$t('elasticsearch_instance.new_instance.add_cluster')" color="primary-dark" @click="dialog = true" />

  <q-dialog v-model="dialog">
    <q-card style="min-width: 800px">
      <q-card-section class="flex justify-between">
        <h2 class="text-h6 q-my-none">{{ $t('elasticsearch_instance.new_instance.heading') }}</h2>
        <q-btn v-close-popup icon="close" flat round dense />
      </q-card-section>

      <q-separator />

      <q-card-section>
        <add-cluster>
          <template #actions>
            <q-btn v-close-popup flat :label="$t('defaults.cancel')" class="q-ml-sm" />
          </template>
        </add-cluster>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
  import { ref } from 'vue'
  import AddCluster from '../setup/AddCluster.vue'

  const dialog = ref(false)
</script>