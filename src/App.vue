<template>
  <q-layout view="hHh lpR fff" class="app-layout" >
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

    <app-footer />
  </q-layout>
</template>

<script setup lang="ts">
  import { onBeforeUnmount, onMounted, ref } from 'vue'
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
  import { useZoomShortcuts } from './helpers/zoomShortcuts.ts'

  const themeStore = useThemeStore()
  const connectionStore = useConnectionStore()

  const route = useRoute()

  const zoom = ref(parseFloat(localStorage.getItem('zoom') || '1'))

  function updateZoom (newZoom: number) {
    zoom.value = newZoom
    localStorage.setItem('zoom', zoom.value.toString())
    document.body.style.zoom = `${zoom.value}`
  }

  const zoomIn = () => {
    updateZoom(Math.max(0.5, zoom.value + 0.1))
  }

  const zoomOut = () => {
    updateZoom(Math.max(0.5, zoom.value - 0.1))
  }
  const resetZoom = () => {
    updateZoom(1)
  }

  useZoomShortcuts(resetZoom)

  // Gestion de la molette
  function handleWheel(event: WheelEvent) {
    if (event.ctrlKey) {
      event.preventDefault()

      // Ajuste le zoom sans appliquer immédiatement
      if (event.deltaY < 0) zoomIn()
      else zoomOut()
    }
  }
  document.documentElement.style.height = '100%'
  document.documentElement.style.width = '100%'

  document.getElementById('app')!.style.height = '100%'
  
  document.body.style.height = '100%'
  document.body.style.width = '100%'
  document.body.style.overflow = 'auto'
  document.body.style.zoom = '0.9'

  onMounted(() => {
    setAppThemeCss(themeStore.appTheme)
    setupThemeListener()
    window.addEventListener('wheel', handleWheel,{ passive: false })
  })
  

  onBeforeUnmount(() => window.removeEventListener('wheel', handleWheel))

</script>

<style>
/* Ensure app takes exactly viewport height */
.app-layout {
  height: inherit ;
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
