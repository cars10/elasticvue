<template>
  <v-btn id="theme_select" :title="$t('app.change_theme.title')" icon @click="dark = !dark">
    <v-icon>mdi-brightness-6</v-icon>
  </v-btn>
</template>

<script>
  import { watch } from 'vue'
  import { vuexAccessors } from '@/helpers/store'
  import { useVuetify } from '@/helpers/composition'

  export default {
    name: 'change-theme',
    setup () {
      const { dark } = vuexAccessors('theme', ['dark'])

      const vuetify = useVuetify()
      watch(dark, newValue => {
        vuetify.theme.dark = newValue
      })

      return {
        dark
      }
    }
  }
</script>
