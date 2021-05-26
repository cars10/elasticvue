<template>
  <v-app :dark="dark">
    <the-header/>

    <v-main>
      <v-container fluid>
        <survey v-if="isConnected"/>
        <router-view/>
      </v-container>
      <snackbar/>
    </v-main>

    <the-footer/>
  </v-app>
</template>

<script>
  import TheHeader from '@/components/App/TheHeader'
  import TheFooter from '@/components/App/TheFooter'
  import Snackbar from '@/components/Snackbar'
  import store from '@/store'
  import { computed } from '@vue/composition-api'
  import Survey from '@/components/shared/Survey'
  import { compositionVuexAccessors } from '@/helpers/store'

  export default {
    name: 'App',
    components: {
      TheHeader,
      TheFooter,
      Snackbar,
      Survey
    },
    setup () {
      const isConnected = computed(() => {
        return store.state.connection.instances.length > 0
      })

      const { dark } = compositionVuexAccessors('theme', ['dark'])

      return {
        dark,
        isConnected
      }
    }
  }
</script>
