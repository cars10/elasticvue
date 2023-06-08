<template>
  <q-btn round
         :icon="icon"
         class="q-mr-md"
         color="dark-grey"
         :title="$t('app.change_theme.title')"
         @click="store.toggleTheme" />
</template>

<script setup lang="ts">
  import { useThemeStore } from '../../store/theme.js'
  import { computed } from 'vue'

  const store = useThemeStore()
  const icon = computed(() => (store.dark ? 'light_mode' : 'nightlight'))
</script>