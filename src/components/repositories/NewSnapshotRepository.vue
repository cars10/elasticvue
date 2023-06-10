<template>
  <q-btn color="primary-dark" :label="t('repositories.new_repository.heading')" @click="dialog = true" />

  <q-dialog v-model="dialog" @hide="resetForm">
    <q-card style="width: 500px">
      <q-card-section class="flex justify-between">
        <h2 class="text-h6 q-my-none">
          {{ t('repositories.new_repository.heading') }}
        </h2>
        <q-btn v-close-popup icon="close" flat round dense />
      </q-card-section>

      <q-separator />

      <q-form @submit="createRepository">
        <q-card-section>
          <q-input v-model="repository.repository"
                   :label="t('repositories.new_repository.form.name.label')"
                   class="q-mb-md"
                   name="name"
                   autocomplete="off"
                   autofocus
                   outlined
                   required />

          <q-input v-model="repository.body.type"
                   :label="t('repositories.new_repository.form.type.label')"
                   class="q-mb-md"
                   name="type"
                   outlined
                   disable />

          <q-input v-model="repository.body.settings.location"
                   :label="t('repositories.new_repository.form.location.label')"
                   class="q-mb-md"
                   name="location"
                   outlined
                   required />

          <q-input v-model="repository.body.settings.chunkSize"
                   :label="t('repositories.new_repository.form.chunk_size.label')"
                   class="q-mb-md"
                   outlined
                   name="chunkSize" />

          <q-input v-model="repository.body.settings.maxRestoreBytesPerSec"
                   :label="t('repositories.new_repository.form.max_restore_bytes_per_sec.label')"
                   class="q-mb-md"
                   name="maxRestoreBytesPerSec"
                   outlined
                   required />

          <q-input v-model="repository.body.settings.maxSnapshotBytesPerSec"
                   :label="t('repositories.new_repository.form.max_snapshot_bytes_per_sec.label')"
                   class="q-mb-md"
                   name="maxSnapshotBytesPerSec"
                   outlined
                   required />

          <div class="q-mt-md">
            <q-checkbox v-model="repository.body.settings.compress" size="32px"
                        :label="t('repositories.new_repository.form.compress.label')"
                        class="q-mb-sm"
                        name="compress" />
          </div>

          <div>
            <q-checkbox v-model="repository.body.settings.readonly" size="32px"
                        :label="t('repositories.new_repository.form.readonly.label')"
                        name="readonly" />
          </div>
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
  import { useNewSnapshotRepository } from '../../composables/components/repositories/NewSnapshotRepository'
  import { useTranslation } from '../../composables/i18n.ts'
  const t = useTranslation()
  const emit = defineEmits(['reload'])
  const {
    repository,
    loading,
    dialog,
    formValid,
    resetForm,
    createRepository
  } = useNewSnapshotRepository({ emit })
</script>
