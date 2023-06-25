<template>
  <div class="row">
    <div class="col-md-8 offset-md-2 col-sm-12">
      <q-card>
        <q-card-section>
          <h1 class="text-h5 q-my-none">
            {{ t('settings.heading') }}
          </h1>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div class="row q-mb-lg">
            <div class="col-md-6 col-sm-12">
              <q-input v-model="indicesStore.hideIndicesRegex"
                       autofocus
                       outlined
                       :label="t('settings.hide_indices_regex.label')"
                       :hint="t('settings.hide_indices_regex.message')">
                <template #append>
                  <q-btn icon="settings_backup_restore"
                         flat round
                         :title="t('settings.hide_indices_regex.reset', {regex: DEFAULT_HIDE_INDICES_REGEX})"
                         @click="resetHideIndicesRegex" />
                </template>
              </q-input>
            </div>
          </div>

          <div class="row q-mb-lg">
            <div class="col-md-6 col-sm-12">
              <q-checkbox v-model="searchStore.localizeTimestamp" :label="t('settings.localize_timestamp.label')" />
            </div>
          </div>

          <q-separator class="q-mb-md" />

          <div>
            <p>{{ t('settings.disconnect_and_reset.heading') }}</p>

            <q-btn color="dark-grey" @click="reset">
              <q-icon name="warning" size="xs" color="negative" class="q-mr-sm" />
              {{ t('settings.disconnect_and_reset.button') }}
            </q-btn>
          </div>
        </q-card-section>
      </q-card>

      <import-export />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useIndicesStore } from '../../store/indices'
  import { DEFAULT_HIDE_INDICES_REGEX } from '../../consts'
  import { askConfirm } from '../../helpers/dialogs'
  import { useTranslation } from '../../composables/i18n'
  import ImportExport from './ImportExport.vue'
  import { useSearchStore } from '../../store/search.ts'

  const t = useTranslation()
  const indicesStore = useIndicesStore()
  const searchStore = useSearchStore()

  const resetHideIndicesRegex = () => {
    indicesStore.hideIndicesRegex = DEFAULT_HIDE_INDICES_REGEX
  }

  const reset = async () => {
    const confirmed = await askConfirm(t('settings.disconnect_and_reset.confirm'))
    if (!confirmed) return

    window.indexedDB.databases().then(databases => {
      databases.forEach(db => {
        if (db?.name) window.indexedDB.deleteDatabase(db.name)
      })
    })

    localStorage.clear()

    window.location.reload()
  }
</script>