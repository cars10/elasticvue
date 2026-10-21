<template>
  <q-layout view="hHh lpR fff" style="outline: none !important">
    <app-header v-if="connectionStore.activeCluster" />

    <q-page-container>
      <div class="q-ma-md">
        <cluster-login v-if="showLogin" />
        <router-view v-else-if="showClusterView || route.name === 'settings'" />
        <div v-else-if="connectionStore.activeCluster?.status === 'unknown'" class="q-pa-lg">
          <div class="row">
            <div class="col-6 offset-3">
              <network-error />
            </div>
          </div>
        </div>
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
import AppHeader from './components/base/AppHeader.vue'
import AppFooter from './components/base/AppFooter.vue'
import ModalLoader from './components/shared/ModalLoader.vue'
import AlertSnackbar from './components/shared/AlertSnackbar.vue'
import NetworkError from './components/shared/NetworkError.vue'
import { useThemeStore } from './store/theme.ts'
import { useConnectionStore } from './store/connection'
import { setAppThemeCss, setupThemeListener } from './helpers/theme.ts'
import TauriUpdateCheck from './components/base/TauriUpdateCheck.vue'
import { buildConfig } from './buildConfig.ts'
import ClusterLogin from './components/setup/ClusterLogin.vue'
import { needsPassword } from './services/SessionPasswords.ts'

const themeStore = useThemeStore()
const connectionStore = useConnectionStore()
const route = useRoute()

// No cluster: show the welcome page. With a cluster, wait for uuid so
// per-cluster IndexedDB is ready (mainly first paint of docker predefined clusters).
const showClusterView = computed(() => {
  const cluster = connectionStore.activeCluster
  if (!cluster) return true
  return Boolean(cluster.uuid && cluster.status !== 'unknown')
})

// Clusters with "promptPassword" ask for their password once per session before any request is sent.
const showLogin = computed(() => {
  const cluster = connectionStore.activeCluster
  return Boolean(cluster && needsPassword(cluster) && route.name !== 'settings')
})

onMounted(() => {
  setAppThemeCss(themeStore.appTheme)
  setupThemeListener()
})
</script>
