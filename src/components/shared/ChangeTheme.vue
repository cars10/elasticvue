<template>
  <v-switch id="theme_select" v-model="dark" class="mt-0 mb-2 pt-0" color="primary-button" hide-details
            label="Dark theme"/>
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
