<template>
  <div class="d-inline-block">
    <v-menu offset-x top>
      <template v-slot:activator="{ on, attrs }">
        <v-btn v-bind="attrs" v-on="on" icon :title="$t('app.change_language.title')" id="change_language">
          <v-icon>mdi-translate</v-icon>
        </v-btn>
      </template>
      <v-list class="pa-0">
        <v-list-item @click="changeLanguage('en')"
                     class="pa-3"
                     :class="{'v-list-item--active': currentLocale === 'en'}"
                     :title="$t('app.change_language.languages.en.title')">
          <v-list-item-title>
            <img :src="en" alt="British flag" height="16" class="vertical-align--middle" id="en_flag">
          </v-list-item-title>
        </v-list-item>
        <v-list-item @click="changeLanguage('cn')"
                     class="pa-3"
                     :class="{'v-list-item--active': currentLocale === 'cn'}"
                     :title="$t('app.change_language.languages.cn.title')">
          <v-list-item-title>
            <img :src="cn" alt="Chinese flag" height="16" class="vertical-align--middle" id="cn_flag">
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script>
  import store from '@/store'
  import { computed } from 'vue'

  import en from '@/assets/icons/flags/en.svg'
  import cn from '@/assets/icons/flags/cn.svg'

  export default {
    name: 'change-language',
    setup () {
      const changeLanguage = lang => {
        store.commit('language/setLanguage', lang)
        window.location.reload()
      }

      const currentLocale = computed(() => {
        return store.state.language.language
      })

      return {
        changeLanguage,
        currentLocale,
        en,
        cn
      }
    }
  }
</script>
