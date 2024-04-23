<template>
  <q-btn color="primary-dark" :label="t('repositories.new_repository.heading')" @click="dialog = true" />

  <q-dialog v-model="dialog" transition-duration="100" @hide="hide">
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

          {{ t('repositories.new_repository.form.type.label') }}
          <q-option-group v-model="repository.body.type"
                          inline
                          :options="Object.keys(RepositoryType).map(type => ({value: type, label: type}))"
                          color="primary" />

          <q-separator class="q-my-lg" />
          <p>{{ repository.body.type.toUpperCase() }} settings</p>

          <template v-if="repository.body.type == RepositoryType.s3">
            <q-input v-model="repository.body.settings.bucket"
                     :label="t('repositories.new_repository.form.bucket.label')"
                     class="q-mb-md"
                     outlined
                     required />

            <q-input v-model="repository.body.settings.client"
                     :label="t('repositories.new_repository.form.client.label')"
                     class="q-mb-md"
                     outlined
                     required />

            <q-input v-model="repository.body.settings.region"
                     :label="t('repositories.new_repository.form.region.label')"
                     class="q-mb-md"
                     outlined
                     required />

            <q-select v-model="repository.body.settings.protocol"
                      :label="t('repositories.new_repository.form.protocol.label')"
                      class="q-mb-md"
                      :options="Object.keys(RepositoryProtocol)"
                      required
                      outlined />

            <div class="q-mt-md">
              <q-checkbox v-model="repository.body.settings.path_style_access" size="32px"
                          :label="t('repositories.new_repository.form.path_style_access.label')"
                          class="q-mb-sm" />
            </div>
          </template>

          <q-input v-if="repository.body.type == 'fs'"
                   v-model="repository.body.settings.location"
                   :label="t('repositories.new_repository.form.location.label')"
                   class="q-mb-md"
                   name="location"
                   outlined
                   required />

          <q-separator class="q-my-lg" />
          <p>General settings</p>

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
  import {
    RepositoryProtocol,
    RepositoryType,
    useNewSnapshotRepository
  } from '../../composables/components/repositories/NewSnapshotRepository'
  import { useTranslation } from '../../composables/i18n.ts'

  const t = useTranslation()
  const emit = defineEmits(['reload'])

  const {
    repository,
    loading,
    dialog,
    formValid,
    hide,
    createRepository
  } = useNewSnapshotRepository(emit)
</script>
