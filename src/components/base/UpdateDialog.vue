<template>
  <q-dialog v-model="store.dialog" transition-duration="100" :persistent="busy" @hide="resetFailedInstall">
    <q-card style="width: 500px">
      <q-card-section class="flex justify-between">
        <h2 class="text-h6 q-my-none">
          {{ t('update_check.heading') }}
        </h2>
        <q-btn v-if="!busy" v-close-popup icon="close" flat round dense :aria-label="t('defaults.close')" />
      </q-card-section>

      <q-separator />

      <q-card-section>
        <div v-if="store.installState === 'downloading'">
          <template v-if="store.downloadProgress === null">
            {{ t('update_check.downloading_unknown') }}
            <q-linear-progress indeterminate size="12" class="q-mt-sm" />
          </template>
          <template v-else>
            {{ t('update_check.downloading', { progress: Math.floor(store.downloadProgress * 100) }) }}
            <q-linear-progress instant-feedback :value="store.downloadProgress" size="12" class="q-mt-sm" />
          </template>
        </div>
        <div v-else-if="store.installState === 'installing'">
          {{ t('update_check.installing') }}
        </div>
        <div v-else-if="store.installState === 'failed'">
          <div>{{ t('update_check.install_failed') }}</div>
          <div v-if="store.installError" class="text-muted font-13 q-mt-sm">{{ store.installError }}</div>
        </div>
        <div v-else-if="store.availableVersion">
          {{ t('update_check.update_info', { version: store.availableVersion }) }}
        </div>
      </q-card-section>

      <q-card-section v-if="store.installState === 'failed'" class="q-gutter-sm">
        <q-btn :label="t('update_check.retry')" color="positive" @click="installUpdate" />
        <q-btn outline :href="RELEASES_URL" target="_blank" rel="nofollow" :label="t('update_check.release_notes')" />
        <q-btn v-close-popup flat :label="t('defaults.close')" />
      </q-card-section>
      <q-card-section v-else-if="!busy" class="q-gutter-sm">
        <q-btn :label="t('update_check.install')" color="positive" @click="installUpdate" />
        <q-btn v-close-popup flat :label="t('update_check.later')" />
        <q-btn v-if="!store.skipped" flat :label="t('update_check.skip')" @click="store.skip()" />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTranslation } from '../../composables/i18n.ts'
import { installUpdate } from '../../composables/UpdateCheck.ts'
import { useUpdateCheckStore } from '../../store/updateCheck.ts'
import { RELEASES_URL } from '../../helpers/updateCheck.ts'

const t = useTranslation()
const store = useUpdateCheckStore()

const busy = computed(() => store.installState === 'downloading' || store.installState === 'installing')

const resetFailedInstall = () => {
  if (store.installState === 'failed') store.installState = 'idle'
}
</script>
