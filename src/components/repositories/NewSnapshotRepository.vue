<template>
  <q-btn color="primary-dark" :label="$t('repositories.new_repository.heading')" @click="dialog = true" />

  <q-dialog v-model="dialog" @hide="resetForm">
    <q-card style="width: 500px">
      <q-card-section class="flex justify-between">
        <h2 class="text-h6 q-my-none">
          {{ $t('repositories.new_repository.heading') }}
        </h2>
        <q-btn v-close-popup icon="close" flat round dense />
      </q-card-section>

      <q-separator />

      <q-form @submit="createRepository">
        <q-card-section>
          <q-input v-model="repository.repository"
                   :label="$t('repositories.new_repository.form.name.label')"
                   class="q-mb-sm"
                   name="name"
                   autocomplete="off"
                   autofocus
                   required />

          <q-input v-model="repository.body.type"
                   :label="$t('repositories.new_repository.form.type.label')"
                   class="q-mb-sm"
                   name="type"
                   disable />

          <q-input v-model="repository.body.settings.location"
                   :label="$t('repositories.new_repository.form.location.label')"
                   class="q-mb-sm"
                   name="location"
                   required />

          <q-input v-model="repository.body.settings.chunkSize"
                   :label="$t('repositories.new_repository.form.chunk_size.label')"
                   class="q-mb-sm"
                   name="chunkSize" />

          <q-input v-model="repository.body.settings.maxRestoreBytesPerSec"
                   :label="$t('repositories.new_repository.form.max_restore_bytes_per_sec.label')"
                   class="q-mb-sm"
                   name="maxRestoreBytesPerSec"
                   required />

          <q-input v-model="repository.body.settings.maxSnapshotBytesPerSec"
                   :label="$t('repositories.new_repository.form.max_snapshot_bytes_per_sec.label')"
                   class="q-mb-sm"
                   name="maxSnapshotBytesPerSec"
                   required />

          <div class="q-mt-md">
            <q-checkbox v-model="repository.body.settings.compress"
                        :label="$t('repositories.new_repository.form.compress.label')"
                        class="q-mb-sm"
                        name="compress" />
          </div>

          <div>
            <q-checkbox v-model="repository.body.settings.readonly"
                        :label="$t('repositories.new_repository.form.readonly.label')"
                        name="readonly" />
          </div>
        </q-card-section>

        <q-card-section>
          <q-btn :disable="requestState.loading || !formValid"
                 :loading="requestState.loading"
                 :label="$t('defaults.create')"
                 color="positive"
                 type="submit"
                 class="q-mr-md" />
          <q-btn v-close-popup flat :label="$t('defaults.close')" />
        </q-card-section>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup>
  import { computed, ref } from 'vue'
  import { useTranslation } from '../../composables/i18n'
  import { useElasticsearchAdapter } from '../../composables/CallElasticsearch'
  import { useSnackbar } from '../../composables/Snackbar'

  const t = useTranslation()

  const dialog = ref(false)
  const repository = ref({})

  const formValid = computed(() => {
    return repository.value.repository.trim().length > 0 && repository.value.body.settings.location.trim().length > 0
  })
  const { showSnackbar } = useSnackbar()
  const { requestState, callElasticsearch } = useElasticsearchAdapter()

  const resetForm = () => {
    repository.value = {
      repository: '',
      body: {
        type: 'fs',
        settings: {
          location: '',
          compress: true,
          chunkSize: '',
          maxRestoreBytesPerSec: '40mb',
          maxSnapshotBytesPerSec: '40mb',
          readonly: false
        }
      }
    }
  }
  resetForm()

  const closeDialog = () => {
    resetForm()
    dialog.value = false
  }

  const emit = defineEmits(['reload'])

  const createRepository = () => {
    callElasticsearch('snapshotCreateRepository', repository.value)
      .then(() => {
        emit('reload')
        showSnackbar(requestState.value, {
          body: t('repositories.new_repository.create_repository.growl', { repositoryName: repository.value.repository }),
        })
        closeDialog()
      })
      .catch(() => showSnackbar(requestState.value))
  }
</script>
