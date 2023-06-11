<template>
  <q-btn icon="translate" round color="dark-grey" :title="t('app.change_language.title')"
         data-testid="change-language-button">
    <q-menu>
      <q-list>
        <q-item v-close-popup
                clickable
                active-class="bg-grey-8"
                :active="store.language === 'en'"
                :title="t('app.change_language.languages.en.title')"
                data-testid="change-language__english"
                @click="changeLanguage('en')">
          <q-item-section>
            <img :src="en" alt="English" height="16">
          </q-item-section>
        </q-item>
        <q-item v-close-popup
                clickable
                active-class="bg-grey-8"
                :active="store.language === 'cn'"
                :title="t('app.change_language.languages.cn.title')"
                data-testid="change-language__chinese"
                @click="changeLanguage('cn')">
          <q-item-section>
            <img :src="cn" alt="Chinese" height="16">
          </q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>
</template>

<script setup lang="ts">
  import en from '../../assets/images/icons/flags/en.svg'
  import cn from '../../assets/images/icons/flags/cn.svg'
  import { useI18nStore } from '../../store/i18n'
  import { useTranslation } from '../../composables/i18n.ts'

  const store = useI18nStore()
  const t = useTranslation()

  const changeLanguage = (lang: string) => {
    store.setLanguage(lang)
    window.location.reload()
  }
</script>
