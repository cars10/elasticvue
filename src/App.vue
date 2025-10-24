<template>
  <q-layout view="hHh lpR fff" style="outline: none !important;">
    <app-header v-if="connectionStore.activeCluster" />

    <q-page-container class="app-content">
      <div class="app-page">
        <router-view v-if="connectionStore.activeCluster?.status !== 'unknown' || route.name === 'settings'" />
        <div v-else class="q-pa-lg">
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

    <app-footer v-if="route.name !== 'search'" />
  </q-layout>
</template>

<script setup lang="ts">
  import { onMounted } from 'vue'
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

const themeStore = useThemeStore()
const connectionStore = useConnectionStore()

const route = useRoute()

  onMounted(() => {
    setAppThemeCss(themeStore.appTheme)
    setupThemeListener()
  })
</script>

<style>
/* Ensure app takes exactly viewport height */
.app-layout {
  min-height: unset;
  height: 100% ;
  display: flex;
  flex-direction: column;
}

/* Container for scrollable content */
.app-content {
  flex: 1;
  min-height: 0; /* Allow flex item to shrink below content size */
  display: flex;
  flex-direction: column;  
}

/* Page content that will scroll */
.app-page {
  flex: 1;
  min-height: 0;
  overflow: auto;  
  display: flex;
  flex-direction: column;
}

/* Ensure Quasar footer stays at bottom */
.q-footer {
  flex-shrink: 0;
}

/* Ensure Quasar header stays at top */
.q-header {
  flex-shrink: 0;
}
</style>
