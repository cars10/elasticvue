<template>
  <q-btn color="dark-grey" icon="restore" @click="dialog = true" />

  <q-dialog v-model="dialog" @hide="resetForm">
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
          <index-filter v-model="restoreOptions.indices"
                        class="q-mb-lg"
                        method="catIndices"
                        :method-params="{ index: restoreOptions.indices, h: 'index' }" />

          <q-input v-model="restoreOptions.renamePattern"
                   outlined
                   :label="$t('snapshots.restore_snapshot.form.rename_pattern.label')"
                   class="q-mb-sm" />

          <q-input v-model="restoreOptions.renameReplacement"
                   outlined
                   :label="$t('snapshots.restore_snapshot.form.rename_replacement.label')"
                   class="q-mb-sm" />

          <div class="q-mt-md">
            <q-checkbox v-model="restoreOptions.ignoreUnavailable"
                        :label="$t('snapshots.restore_snapshot.form.ignore_unavailable.label')"
                        class="q-mb-sm"
                        name="ignore_unavailable" />
          </div>

          <q-checkbox v-model="restoreOptions.includeGlobalState"
                      :label="$t('snapshots.restore_snapshot.form.include_global_state.label')"
                      class="q-mb-sm"
                      name="include_global_state" />
        </q-card-section>

        <q-card-section>
          <q-btn :disable="requestState.loading || !formValid"
                 :loading="requestState.loading"
                 :label="$t('snapshots.restore_snapshot.form.restore')"
                 color="positive"
                 type="submit"
                 class="q-mr-md" />
          <q-btn v-close-popup flat :label="$t('defaults.close')" />
        </q-card-section>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
  import IndexFilter from '../shared/IndexFilter.vue'
  import { useTranslation } from '../../composables/i18n'
  import { useRestoreSnapshot } from '../../composables/components/snapshots/RestoreSnapshot'

  const props = defineProps<{ repository: string, snapshot: string }>()
  const emit = defineEmits(['reload'])
  const t = useTranslation()

  const { dialog, formValid, requestState, restoreSnapshot,restoreOptions, resetForm } = useRestoreSnapshot({
    emit,
    repository: props.repository,
    snapshot: props.snapshot
  })
</script>
