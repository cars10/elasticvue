<template>
  <q-layout view="hHh Lpr lff" style="outline: none !important">
    <beta-banner />
    <app-sidebar v-if="connectionStore.activeCluster" :key="connectionStore.activeClusterId ?? ''" />

    <q-page-container>
      <div class="app-content">
        <router-view v-if="showClusterView" />
        <div v-else-if="session.connectState === 'error'" class="q-pa-lg">
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
import AppSidebar from './components/base/AppSidebar.vue'
import AppFooter from './components/base/AppFooter.vue'
import BetaBanner from './components/base/BetaBanner.vue'
import ModalLoader from './components/shared/ModalLoader.vue'
import AlertSnackbar from './components/shared/AlertSnackbar.vue'
import NetworkError from './components/shared/NetworkError.vue'
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

const showClusterView = computed(
  () => typeof route.params.clusterId === 'undefined' || route.name === 'settings' || session.connectState === 'ready'
)

onMounted(() => {
  setAppThemeCss(themeStore.appTheme)
  setupThemeListener()
})
</script>
