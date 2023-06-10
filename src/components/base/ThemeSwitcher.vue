<template>
  <q-btn round
         :icon="icon"
         class="q-mr-md"
         color="dark-grey"
         :title="t('app.change_theme.title')"
         @click="store.toggleTheme" />
</template>

<script setup lang="ts">
  import { useThemeStore } from '../../store/theme.js'
  import { computed } from 'vue'
  import { useTranslation } from '../../composables/i18n.ts'

  const store = useThemeStore()
  const t = useTranslation()
  const icon = computed(() => (store.dark ? 'light_mode' : 'nightlight'))
</script>