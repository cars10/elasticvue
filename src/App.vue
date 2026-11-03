<template>
  <q-layout view="hHh Lpr lff" style="outline: none !important">
    <beta-banner />
    <app-sidebar v-if="connectionStore.activeCluster" :key="connectionStore.activeClusterId ?? ''" />

    <q-page-container>
      <div class="app-content">
        <router-view v-if="showClusterView" />
        <cluster-credentials v-else-if="session.connectState === 'credentials'" :key="session.clusterId ?? ''" />
        <div v-else-if="session.connectState === 'connecting'" class="flex flex-center q-pa-xl">
          <q-spinner size="lg" data-testid="cluster-connecting" />
        </div>
        <cluster-unreachable v-else-if="session.connectState === 'error'" />
      </div>
    </q-page-container>

    <modal-loader />
    <alert-snackbar />
    <tauri-update-check v-if="buildConfig.tauri" />

    <app-footer />
  </q-layout>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from './components/base/AppSidebar.vue'
import AppFooter from './components/base/AppFooter.vue'
import BetaBanner from './components/base/BetaBanner.vue'
import ModalLoader from './components/shared/ModalLoader.vue'
import AlertSnackbar from './components/shared/AlertSnackbar.vue'
import ClusterUnreachable from './components/shared/ClusterUnreachable.vue'
import ClusterCredentials from './components/setup/ClusterCredentials.vue'
import { useThemeStore } from './store/theme.ts'
import { useConnectionStore } from './store/connection'
import { useClusterSession } from './store/clusterSession.ts'
import { setAppThemeCss, setupThemeListener } from './helpers/theme.ts'
import TauriUpdateCheck from './components/base/TauriUpdateCheck.vue'
import { buildConfig } from './buildConfig.ts'

const themeStore = useThemeStore()
const connectionStore = useConnectionStore()
const session = useClusterSession()
const route = useRoute()

const knownCluster = computed(() => {
  const cluster = connectionStore.activeCluster
  return Boolean(cluster?.version && cluster.status !== 'unknown')
})

const showClusterView = computed(() => {
  if (typeof route.params.clusterId === 'undefined' || route.name === 'settings' || route.name === 'clusters') return true
  if (session.connectState === 'connecting') return knownCluster.value
  return session.connectState === 'ready'
})

onMounted(() => {
  setAppThemeCss(themeStore.appTheme)
  setupThemeListener()
})
</script>
