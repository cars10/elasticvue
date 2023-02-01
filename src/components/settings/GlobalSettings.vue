<template>
  <div class="row">
    <div class="col-md-8 offset-md-2">
      <q-card>
        <q-card-section>
          <h2 class="text-h5 q-my-none d-inline-block">
            {{ $t('settings.heading') }}
          </h2>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div class="row q-mb-lg">
            <div class="col-md-6 col-sm-12">
              <q-input v-model="indicesStore.hideIndicesRegex"
                       autofocus
                       :label="$t('settings.hide_indices_regex.label')"
                       :hint="$t('settings.hide_indices_regex.message')">
                <template #append>
                  <q-btn icon="settings_backup_restore"
                         flat round
                         :title="$t('settings.hide_indices_regex.reset', {regex: DEFAULT_HIDE_INDICES_REGEX})"
                         @click="resetHideIndicesRegex" />
                </template>
              </q-input>
            </div>
          </div>

          <q-separator class="q-mb-md" />

          <div>
            <p>{{ $t('settings.disconnect_and_reset.heading') }}</p>

            <q-btn color="visible-bg" @click="reset">
              <q-icon name="warning" size="xs" color="negative" class="q-mr-sm" />
              {{ $t('settings.disconnect_and_reset.button') }}
            </q-btn>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup>
  import { useIndicesStore } from '../../store/indices'
  import { DEFAULT_HIDE_INDICES_REGEX } from '../../consts'
  import { askConfirm } from '../../helpers/dialogs'
  import { useTranslation } from '../../composables/i18n'
  import { useCodeEditorStore } from '../../store/code_editor'
  import { useI18nStore } from '../../store/i18n'
  import { useModalStore } from '../../store/modal'
  import { useResizeStore } from '../../store/resize'
  import { useSnackbarStore } from '../../store/snackbar'
  import { useThemeStore } from '../../store/theme'

  const t = useTranslation()

  const indicesStore = useIndicesStore()

  const resetHideIndicesRegex = () => {
    indicesStore.hideIndicesRegex = DEFAULT_HIDE_INDICES_REGEX
  }

  const reset = async () => {
    const confirmed = await askConfirm(t('settings.disconnect_and_reset.confirm'))
    if (!confirmed) return

    window.indexedDB.databases().then(databases => {
      databases.forEach(db => window.indexedDB.deleteDatabase(db.name))
    })

    useCodeEditorStore().$reset()
    useI18nStore().$reset()
    useIndicesStore().$reset()
    useModalStore().$reset()
    useResizeStore().$reset()
    useSnackbarStore().$reset()
    useThemeStore().$reset()

    window.location.reload()
  }
</script>