<template>
  <q-btn icon="translate" round color="dark-grey" :title="t('base.language_switcher.title')"
         data-testid="change-language-button">
    <q-menu>
      <q-list>
        <q-item v-for="{code, title, icon} in languages"
                :key="code"
                v-close-popup
                clickable
                dense
                active-class="bg-grey-8"
                :active="store.language === code"
                :title="title"
                :data-testid="`change-language__${code}`"
                @click="changeLanguage(code)">
          <q-item-section>
            <img :src="icon" :alt="title" height="16">
          </q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>
</template>

<script setup lang="ts">
  import en from '../../assets/images/icons/flags/en.svg'
  import cn from '../../assets/images/icons/flags/cn.svg'
  import fr from '../../assets/images/icons/flags/fr.svg'
  import { useI18nStore } from '../../store/i18n'
  import { useTranslation } from '../../composables/i18n.ts'
  import { ValidLocale } from '../../consts.ts'
  import { useRouter } from 'vue-router'

  const store = useI18nStore()
  const t = useTranslation()
  const router = useRouter()

  const changeLanguage = (lang: ValidLocale) => {
    store.setLanguage(lang)
    router.go(0)
  }

  type Language = {
    code: ValidLocale
    title: string
    icon: string
  }
  const languages: Language[] = [
    { code: 'en', title: t('base.language_switcher.languages.en.title'), icon: en },
    { code: 'cn', title: t('base.language_switcher.languages.cn.title'), icon: cn },
    { code: 'fr', title: t('base.language_switcher.languages.fr.title'), icon: fr }
  ]
</script>
