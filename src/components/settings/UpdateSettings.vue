<template>
  <settings-section :title="t('settings.updates.heading')" data-testid="settings-updates">
    <settings-row :label="t('settings.updates.current_version', { version })">
      <template #description>
        <div data-testid="update-status">{{ statusText }}</div>
        <div v-if="lastChecked">{{ t('settings.updates.last_checked', { date: lastChecked }) }}</div>
      </template>
      <q-btn
        outline
        :label="t('settings.updates.check')"
        :loading="store.status === 'checking'"
        data-testid="update-check-button"
        @click="checkForUpdate"
      />
    </settings-row>

    <settings-row
      v-if="store.status === 'available'"
      :label="t('settings.updates.available.label', { version: store.availableVersion })"
      :description="modeHint"
      data-testid="update-available"
    >
      <div class="row items-center justify-end q-gutter-sm">
        <q-btn
          v-if="store.mode === 'self_update'"
          color="positive"
          :label="t('update_check.install')"
          data-testid="update-install-button"
          @click="store.dialog = true"
        />
        <q-btn
          v-else
          outline
          :href="RELEASES_URL"
          target="_blank"
          rel="nofollow"
          :label="t('update_check.release_notes')"
          data-testid="update-release-notes"
        />
        <q-btn
          v-if="store.skipped"
          flat
          :label="t('settings.updates.available.undo_skip')"
          data-testid="update-undo-skip-button"
          @click="store.unskip()"
        />
        <q-btn v-else flat :label="t('update_check.skip')" data-testid="update-skip-button" @click="store.skip()" />
      </div>
    </settings-row>

    <settings-row
      tag="label"
      :label="t('settings.updates.auto_check.label')"
      :description="t('settings.updates.auto_check.message')"
    >
      <q-toggle
        v-model="store.autoCheck"
        :aria-label="t('settings.updates.auto_check.label')"
        data-testid="settings-update-auto-check"
      />
    </settings-row>
  </settings-section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTranslation } from '../../composables/i18n'
import { checkForUpdate } from '../../composables/UpdateCheck.ts'
import { RELEASES_URL, UpdateMode } from '../../helpers/updateCheck.ts'
import { UpdateStatus, useUpdateCheckStore } from '../../store/updateCheck.ts'
import SettingsSection from './SettingsSection.vue'
import SettingsRow from './SettingsRow.vue'

const t = useTranslation()
const store = useUpdateCheckStore()

const version = __APP_VERSION__

const statusText = computed(() => {
  const texts: Record<UpdateStatus, string> = {
    idle: t('settings.updates.status.idle'),
    checking: t('settings.updates.status.checking'),
    up_to_date: t('settings.updates.status.up_to_date'),
    available: t('settings.updates.status.available', { version: store.availableVersion }),
    failed: t('settings.updates.status.failed')
  }
  return texts[store.status]
})

const modeHint = computed(() => {
  const hints: Record<UpdateMode, string> = {
    self_update: t('settings.updates.available.hint_self_update'),
    package_manager: t('settings.updates.available.hint_package_manager'),
    docker: t('settings.updates.available.hint_docker'),
    browser_extension: t('settings.updates.available.hint_browser_extension'),
    manual: t('settings.updates.available.hint_manual')
  }
  return hints[store.mode]
})

const lastChecked = computed(() => (store.lastCheckedAt ? new Date(store.lastCheckedAt).toLocaleString() : ''))
</script>
