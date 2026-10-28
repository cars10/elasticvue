<template>
  <q-footer class="app-footer bg-transparent">
    <div class="row items-center q-gutter-x-lg q-gutter-y-sm">
      <div v-if="!connectionStore.activeCluster" class="row items-center q-gutter-x-sm">
        <theme-switcher />
        <language-switcher />
      </div>
      <div>
        Elasticvue <span id="version">{{ version }}-{{ VERSION_NAME }}</span>
        <update-check v-if="!buildConfig.tauri" class="q-ml-sm" />
      </div>
      <div>&copy;{{ new Date().getFullYear() }} Carsten K&ouml;nig</div>
      <a href="https://github.com/cars10/elasticvue" rel="nofollow" target="_blank" class="decoration-none">Github</a>
      <a href="https://elasticvue.com" rel="nofollow" target="_blank" class="decoration-none">{{
        t('base.app_footer.homepage')
      }}</a>
    </div>
  </q-footer>
</template>

<script setup lang="ts">
import LanguageSwitcher from './LanguageSwitcher.vue'
import ThemeSwitcher from './ThemeSwitcher.vue'
import { useTranslation } from '../../composables/i18n.ts'
import { useConnectionStore } from '../../store/connection'
import { VERSION_NAME } from '../../consts.ts'
import UpdateCheck from './UpdateCheck.vue'
import { buildConfig } from '../../buildConfig.ts'

const t = useTranslation()
const connectionStore = useConnectionStore()

const version = __APP_VERSION__
</script>
