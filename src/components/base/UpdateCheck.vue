<template>
  <q-dialog v-model="dialog" transition-duration="100">
    <q-card style="width: 500px">
      <q-card-section class="flex justify-between">
        <h2 class="text-h6 q-my-none">
          {{ t('update_check.heading') }}
        </h2>
        <q-btn v-if="!downloading && !installing" v-close-popup icon="close" flat round dense />
      </q-card-section>

      <q-separator />

      <q-card-section>
        <div v-if="downloading">
          {{ t('update_check.downloading', { progress: Math.floor(downloadProgress * 100) }) }}
          <q-linear-progress instant-feedback :value="downloadProgress" size="12" class="q-mt-sm" />
        </div>
        <div v-else-if="installing">
          {{ t('update_check.installing') }}
        </div>
        <div v-else-if="updateInfo">
          {{ t('update_check.update_info', { version: updateInfo.version }) }}
        </div>
      </q-card-section>

      <q-card-section v-if="!downloading && !installing">
        <q-btn :label="t('update_check.yes')"
               color="positive"
               type="submit"
               class="q-mr-md"
               @click="downloadUpdate" />
        <q-btn v-close-popup flat :label="t('defaults.cancel')" />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
  import { onMounted } from 'vue'
  import { useTranslation } from '../../composables/i18n.ts'
  import { useUpdateCheck } from '../../composables/UpdateCheck.ts'

  const t = useTranslation()

  onMounted(() => checkUpdate())

  const {
    checkUpdate,
    downloadUpdate,
    downloading,
    downloadProgress,
    installing,
    updateInfo,
    dialog
  } = useUpdateCheck()
</script>
