<template>
  <q-btn color="dark-grey" icon="restore" @click="dialog = true" />

  <q-dialog v-model="dialog" transition-duration="100" @hide="resetForm">
    <q-card style="width: 500px">
      <q-card-section class="flex justify-between">
        <h2 class="text-h6 q-my-none">
          {{ t('snapshots.restore_snapshot.heading', { name: snapshot }) }}
        </h2>
        <q-btn v-close-popup icon="close" flat round dense />
      </q-card-section>

      <q-separator />

      <q-form @submit="restoreSnapshot">
        <q-card-section>
          <index-select v-model="restoreOptions.indices" :index-names="indexNames" behavior="use" class="q-mb-md" />

          <q-input v-model="restoreOptions.renamePattern"
                   outlined
                   :label="t('snapshots.restore_snapshot.form.rename_pattern.label')"
                   class="q-mb-md" />

          <q-input v-model="restoreOptions.renameReplacement"
                   outlined
                   :label="t('snapshots.restore_snapshot.form.rename_replacement.label')"
                   class="q-mb-md" />

          <div class="q-mt-sm">
            <q-checkbox v-model="restoreOptions.ignoreUnavailable" size="32px"
                        :label="t('snapshots.restore_snapshot.form.ignore_unavailable.label')"
                        class="q-mb-sm"
                        name="ignore_unavailable" />
          </div>

          <q-checkbox v-model="restoreOptions.includeGlobalState" size="32px"
                      :label="t('snapshots.restore_snapshot.form.include_global_state.label')"
                      class="q-mb-sm"
                      name="include_global_state" />
        </q-card-section>

        <q-card-section>
          <q-btn :disable="loading || !formValid"
                 :loading="loading"
                 :label="t('snapshots.restore_snapshot.form.restore')"
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
  import IndexSelect from '../shared/IndexFilter/IndexSelect.vue'
  import { useTranslation } from '../../composables/i18n'
  import { RestoreSnapshotProps, useRestoreSnapshot } from '../../composables/components/snapshots/RestoreSnapshot'

  const props = defineProps<RestoreSnapshotProps>()
  const emit = defineEmits(['reload'])
  const t = useTranslation()

  const {
    dialog,
    formValid,
    loading,
    indexNames,
    restoreSnapshot,
    restoreOptions,
    resetForm
  } = useRestoreSnapshot(props, emit)
</script>
