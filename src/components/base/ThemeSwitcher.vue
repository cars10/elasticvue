<template>
  <q-btn :icon="themeIcon"
         round
         color="dark-grey"
         class="q-mr-md"
         :title="t('base.theme_switcher.title')"
         data-testid="change-theme-button">
    <q-menu>
      <q-list>
        <q-item v-for="(icon, theme) in themes"
                :key="theme"
                v-close-popup
                clickable
                dense
                :active="themeStore.preference === theme"
                :title="theme"
                :data-testid="`change-theme__${theme}`"
                @click="changeTheme(theme)">
          <q-item-section>
            <q-icon :name="icon" :alt="theme" />
          </q-item-section>
          <q-item-section>
            {{ theme }}
          </q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>
</template>

<script setup lang="ts">
  import { useThemeStore } from '../../store/theme.js'
  import { computed } from 'vue'
  import { useTranslation } from '../../composables/i18n.ts'
  import { setAppThemeCss } from '../../helpers/theme.ts'

  const themeStore = useThemeStore()
  const t = useTranslation()
  const themes = {
    light: 'light_mode',
    dark: 'dark_mode',
    auto: 'brightness_medium'
  }
  const changeTheme = (theme) => {
    themeStore.setPreference(theme)
    setAppThemeCss(themeStore.appTheme)
  }

  const themeIcon = computed(() => (themes[themeStore.preference]))
</script>
