<template>
  <q-btn id="new_index" color="primary-dark" :label="t('indices.new_index.heading')" @click="dialog = true" />

  <q-dialog v-model="dialog" transition-duration="100" @hide="resetForm">
    <q-card style="width: 500px">
      <q-card-section class="flex justify-between">
        <h2 class="text-h6 q-my-none">
          {{ t('indices.new_index.heading') }}
        </h2>
        <q-btn v-close-popup icon="close" flat round dense />
      </q-card-section>

      <q-separator />

      <q-form @submit="createIndex">
        <q-card-section>
          <q-input v-model="index.name"
                   :label="t('indices.new_index.form.index_name.label')"
                   class="q-mb-md"
                   lazy-rules
                   autocomplete="off"
                   autofocus
                   outlined
                   required />

          <q-input v-model="index.shards"
                   :label="t('indices.new_index.form.shards.label')"
                   class="q-mb-md"
                   lazy-rules
                   outlined
                   autocomplete="off"
                   type="number" />

          <q-input v-model="index.replicas"
                   :label="t('indices.new_index.form.replicas.label')"
                   lazy-rules
                   outlined
                   autocomplete="off"
                   type="number" />
        </q-card-section>

        <q-card-section>
          <q-btn id="create_index"
                 :disable="loading || !formValid"
                 :loading="loading"
                 :label="t('defaults.create')"
                 color="positive"
                 type="submit"
                 class="q-mr-md" />
          <q-btn v-close-popup flat :label="t('defaults.close')" />
        </q-card-section>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
  import { useTranslation } from '../../composables/i18n'
  import { useNewIndex } from '../../composables/components/indices/NewIndex'

  const t = useTranslation()
  const emit = defineEmits(['reload'])

  const { dialog, index, formValid, loading, createIndex, resetForm } = useNewIndex(emit)
</script>
