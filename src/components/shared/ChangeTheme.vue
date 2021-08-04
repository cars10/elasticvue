<template>
  <v-btn id="theme_select" :title="$t('change-theme.change-theme')" icon @click="dark = !dark">
    <v-icon>mdi-brightness-6</v-icon>
  </v-btn>
</template>

<script>
  import { watch } from '@vue/composition-api'
  import { vuexAccessors } from '@/helpers/store'

  export default {
    name: 'change-theme',
    setup (props, context) {
      const { dark } = vuexAccessors('theme', ['dark'])

      watch(dark, newValue => {
        context.root.$vuetify.theme.dark = newValue
      })

      return {
        dark
      }
    }
  }
</script>
