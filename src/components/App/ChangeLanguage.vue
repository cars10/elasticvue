<template>
  <div class="d-inline-block">
    <v-menu offset-x top>
      <template v-slot:activator="{ on, attrs }">
        <v-btn v-bind="attrs" v-on="on" icon>
          <v-icon>mdi-translate</v-icon>
        </v-btn>
      </template>
      <v-list>
        <v-list-item @click="setLocale('en')">
          <v-list-item-title>
            <img src="../../assets/icons/flags/en.svg" alt="" height="16" class="mr-2">
          </v-list-item-title>
        </v-list-item>
        <v-list-item @click="setLocale('cn')">
          <v-list-item-title>
            <img src="../../assets/icons/flags/cn.svg" alt="" height="16" class="mr-2">
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script>
  import store from '@/store'
  import { SUPPORTED_I18N } from '@/consts'
  import { loadLanguage } from '@/i18n'

  export default {
    name: 'change-language',
    setup () {
      const setLocale = lang => {
        store.commit('language/setLanguage', lang)
        loadLanguage(lang)
      }

      return {
        setLocale,
        SUPPORTED_I18N
      }
    }
  }
</script>
