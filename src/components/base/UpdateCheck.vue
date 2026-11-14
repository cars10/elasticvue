<template>
  <div v-if="store.notify" class="inline-block" data-testid="update-hint">
    <router-link v-if="settingsRoute" :to="settingsRoute" class="decoration-none">{{ label }}</router-link>
    <a v-else :href="RELEASES_URL" target="_blank" rel="nofollow" class="decoration-none">{{ label }}</a>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTranslation } from '../../composables/i18n.ts'
import { useConnectionStore } from '../../store/connection'
import { useUpdateCheckStore } from '../../store/updateCheck.ts'
import { RELEASES_URL } from '../../helpers/updateCheck.ts'

const t = useTranslation()
const store = useUpdateCheckStore()
const connectionStore = useConnectionStore()

const label = computed(() => t('update_check.available', { version: store.availableVersion }))

const settingsRoute = computed(() => {
  if (!connectionStore.activeCluster) return null
  return { name: 'settings', params: { clusterId: connectionStore.activeClusterId } }
})
</script>
