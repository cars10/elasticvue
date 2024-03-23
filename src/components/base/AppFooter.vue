<template>
  <q-footer class="bg-default q-pa-lg">
    <div class="row">
      <div class="col-md-4">
        <theme-switcher />
        <language-switcher />
      </div>

      <div class="col-md-4 text-center">
        <div class="text-subtitle-1">
          Elasticvue {{ version }}-{{ VERSION_NAME }} |
          <a href="https://github.com/cars10/elasticvue/blob/master/CHANGELOG.md" rel="nofollow" target="_blank"
             class="decoration-none">
            {{ t('base.app_footer.changelog') }}
          </a>
        </div>
        &copy;{{ new Date().getFullYear() }} - Carsten K&ouml;nig
      </div>

      <div class="col-md-4 text-right">
        <a href="https://github.com/cars10/elasticvue" rel="nofollow" target="_blank" class="decoration-none">Github</a><br>
        <a href="https://elasticvue.com" rel="nofollow" target="_blank"
           class="decoration-none">{{ t('base.app_footer.homepage') }}</a>
      </div>
    </div>
  </q-footer>
</template>

<script setup lang="ts">
  import LanguageSwitcher from './LanguageSwitcher.vue'
  import ThemeSwitcher from './ThemeSwitcher.vue'
  import { useTranslation } from '../../composables/i18n.ts'
  import { VERSION_NAME } from '../../consts.ts'

  const t = useTranslation()

  const version = __APP_VERSION__
</script>
