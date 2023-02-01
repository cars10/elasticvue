<template>
  <q-layout view="hHh lpR fFf">
    <app-header />

    <q-page-container>
      <div class="q-ma-md">
        <router-view />
      </div>
    </q-page-container>

    <modal-loader />
    <alert-snackbar />

    <app-footer />
  </q-layout>
</template>

<script setup>
  import { useThemeStore } from './store/theme.js'
  import { useQuasar } from 'quasar'
  import AppFooter from './components/base/AppFooter.vue'
  import AppHeader from './components/base/AppHeader.vue'
  import ModalLoader from './components/shared/ModalLoader.vue'
  import AlertSnackbar from './components/shared/AlertSnackbar.vue'

  const store = useThemeStore()

  const $q = useQuasar()
  $q.dark.set(store.dark)
</script>
