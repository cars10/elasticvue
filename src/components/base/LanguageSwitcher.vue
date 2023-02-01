<template>
  <q-btn icon="translate" round>
    <q-menu>
      <q-list>
        <q-item v-close-popup
                clickable
                active-class="bg-grey-8"
                :active="store.language === 'en'"
                @click="changeLanguage('en')">
          <q-item-section>
            <img :src="en" alt="English" height="16">
          </q-item-section>
        </q-item>
        <q-item v-close-popup
                clickable
                active-class="bg-grey-8"
                :active="store.language === 'cn'"
                @click="changeLanguage('cn')">
          <q-item-section>
            <img :src="cn" alt="Chinese" height="16">
          </q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>
</template>

<script setup>
  import en from '../../assets/icons/flags/en.svg'
  import cn from '../../assets/icons/flags/cn.svg'
  import { useI18nStore } from '../../store/i18n'

  const store = useI18nStore()

  const changeLanguage = lang => {
    store.setLanguage(lang)
    window.location.reload()
  }
</script>
