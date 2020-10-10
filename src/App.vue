<template>
  <v-app>
    <the-header/>

    <v-main>
      <v-container fluid>
        <router-view v-if="renderRouterView"/>
        <v-progress-linear v-else color="blue" indeterminate/>
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
  import { ref } from '@vue/composition-api'
  import cachedAdapter from '@/mixins/GetAdapter'

  export default {
    name: 'App',
    components: {
      TheHeader,
      TheFooter,
      Snackbar
    },
    setup () {
      const renderRouterView = ref(true)

      if (store.state.connection.instances.length > 0) {
        cachedAdapter().test()
          .catch(() => {
          })
          .finally(() => (renderRouterView.value = true))
      }

      return {
        renderRouterView
      }
    }
  }
</script>
