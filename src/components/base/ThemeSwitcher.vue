<template>
  <q-btn id="change_theme"
         round
         :icon="icon"
         class="q-mr-md"
         color="dark-grey"
         :title="t('base.theme_switcher.title')"
         data-testid="change-theme-button">
    <q-menu>
      <q-list>
        <q-item v-close-popup
                clickable
                active-class="bg-grey-8"
                :active="store.dark === false"
                :title="t('base.theme_switcher.themes.light')"
                data-testid="change-theme__light"
                @click="changeTheme(false)">
          <q-item-section>
            <q-icon name="light_mode" />
          </q-item-section>
        </q-item>
        <q-item v-close-popup
                clickable
                active-class="bg-grey-8"
                :active="store.dark === true"
                :title="t('base.theme_switcher.themes.dark')"
                data-testid="change-theme__dark"
                @click="changeTheme(true)">
          <q-item-section>
            <q-icon name="nightlight" />
          </q-item-section>
        </q-item>
        <q-item v-close-popup
                clickable
                active-class="bg-grey-8"
                :active="store.dark === 'auto'"
                :title="t('base.theme_switcher.themes.auto')"
                data-testid="change-theme__auto"
                @click="changeTheme('auto')">
          <q-item-section>
            <q-icon name="contrast" />
          </q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>
</template>

<script setup lang="ts">
  import { ValidTheme } from '../../consts.ts'
  import { useThemeStore } from '../../store/theme.js'
  import { computed } from 'vue'
  import { useTranslation } from '../../composables/i18n.ts'

  const store = useThemeStore()
  const t = useTranslation()
  const icon = computed(() => {
    switch (store.dark) {
      case false:
        return 'light_mode'
      case true:
        return 'nightlight'
      default:
        return 'contrast'
    }
  })

  const changeTheme = (theme: ValidTheme) => {
    store.setTheme(theme)
  }
</script>