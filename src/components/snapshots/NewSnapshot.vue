<template>
  <q-btn color="primary-dark" :label="t('snapshots.new_snapshot.heading')" @click="dialog = true" />

  <q-dialog v-model="dialog" transition-duration="100" @hide="resetForm">
    <q-card style="width: 500px">
      <q-card-section class="flex justify-between">
        <h2 class="text-h6 q-my-none">
          {{ t('snapshots.new_snapshot.heading') }}
        </h2>
        <q-btn v-close-popup icon="close" flat round dense />
      </q-card-section>

      <q-separator />

      <q-form @submit="createSnapshot">
        <q-card-section>
          <q-input v-model="snapshot.name"
                   :label="t('snapshots.new_snapshot.form.snapshot_name.label')"
                   outlined
                   class="q-mb-sm"
                   autocomplete="off"
                   autofocus
                   required />

          <index-filter v-model="snapshot.indices" class="q-mt-lg" />
        </q-card-section>

        <q-card-section>
          <q-btn :disable="loading || !formValid"
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
  import IndexFilter from '../shared/IndexFilter.vue'
  import { NewSnapshotProps, useNewSnapshot } from '../../composables/components/snapshots/NewSnapshot'
  import { useTranslation } from '../../composables/i18n.ts'

  const props = defineProps<NewSnapshotProps>()
  const emit = defineEmits(['reload'])
  const t = useTranslation()
  const { dialog, snapshot, formValid, loading, createSnapshot, resetForm } = useNewSnapshot(props, emit)
</script>
