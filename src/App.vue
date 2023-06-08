<template>
  <q-layout view="hHh lpR fff" style="outline: none !important;">
    <app-header v-if="connectionStore.activeCluster" />

    <q-card>
      {{ DESKTOP_BUILD}}
    </q-card>

    <q-page-container>
      <div class="q-ma-md">
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

    <app-footer />
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
  import { useThemeStore } from './store/theme.js'
  import { useConnectionStore } from './store/connection'
  import { DESKTOP_BUILD } from './consts'

  const themeStore = useThemeStore()
  const connectionStore = useConnectionStore()

  const route = useRoute()

  onMounted(() => {
    if (themeStore.dark) {
      document.body.classList.remove('body--light')
      document.body.classList.add('theme--dark')
    } else {
      document.body.classList.remove('theme--dark')
      document.body.classList.add('theme--light')
    }
  })
</script>
