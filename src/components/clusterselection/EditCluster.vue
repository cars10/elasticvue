<template>
  <q-btn icon="edit" round flat size="sm" @click.stop="dialog = true" />

  <q-dialog v-model="dialog">
    <q-card>
      <q-card-section class="flex justify-between">
        <h2 class="text-h6 q-my-none">
          {{ $t('elasticsearch_instance.rename_instance.heading') }}
        </h2>

        <q-btn v-close-popup icon="close" flat round dense />
      </q-card-section>

      <q-separator />

      <q-card-section />

      <q-card-actions>
        <q-btn v-close-popup flat :label="$t('defaults.close')" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
  import { ref } from 'vue'

  const dialog = ref(false)
</script>
