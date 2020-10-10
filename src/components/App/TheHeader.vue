<template>
  <v-app-bar :dense="dense" app>
    <router-link class="mt-2" to="/">
      <img v-if="dark" :height="logoSize" :width="logoSize"
           alt="Logo" src="../../../public/images/logo/white_96.png">
      <img v-else :height="logoSize" :width="logoSize" alt="Logo" src="../../../public/images/logo/blue_96.png">
    </router-link>
    <v-toolbar-title class="mr-6 ml-4 hidden-md-and-down">
      <router-link to="/">
        Elasticvue
      </router-link>
    </v-toolbar-title>

    <div v-if="wasConnected" id="navbar_cluster_health" class="inline-block mt-1 hidden-xs-only">
      <elasticsearch-instance-selection/>
    </div>

    <div class="flex-grow-1"/>

    <v-toolbar-items v-if="wasConnected">
      <v-btn id="navbar_home" exact text to="/">Home</v-btn>
      <v-btn id="navbar_nodes" text to="/nodes">Nodes</v-btn>
      <v-btn id="navbar_indices" text to="/indices">Indices</v-btn>
      <v-btn id="navbar_search" text to="/search">Search</v-btn>
      <v-btn id="navbar_query_rest" text to="/rest">Rest</v-btn>

      <v-menu offset-y>
        <template v-slot:activator="{on}">
          <v-btn id="navbar_snapshots" :class="navbarSnapshotClasses" text v-on="on">
            Snapshots
            <v-icon>mdi-menu-down</v-icon>
          </v-btn>
        </template>

        <v-list>
          <v-list-item id="navbar_snapshots_repositories" to="/snapshot_repositories">
            <v-list-item-content>
              <v-list-item-title>
                Repositories
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item id="navbar_snapshots_snapshots" to="/snapshots">
            <v-list-item-content>
              <v-list-item-title>
                Snapshots
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-menu>

      <v-btn id="navbar_utilities" text to="/utilities">Utilities</v-btn>
    </v-toolbar-items>
  </v-app-bar>
</template>

<script>
  import Timer from '@/components/shared/Timer'
  import { computed, onBeforeUnmount, onMounted, ref } from '@vue/composition-api'
  import store from '@/store'
  import ElasticsearchInstanceSelection from '@/components/ElasticsearchInstance/ElasticsearchInstanceSelection'

  export default {
    name: 'app-header',
    components: {
      Timer,
      ElasticsearchInstanceSelection
    },
    setup (props, context) {
      const scrolledDown = ref(false)
      const setScrolledDown = () => (scrolledDown.value = window.pageYOffset > 0)
      onMounted(() => {
        if (typeof window !== 'undefined') window.addEventListener('scroll', setScrolledDown)
      })
      onBeforeUnmount(() => {
        if (typeof window !== 'undefined') window.removeEventListener('scroll', setScrolledDown)
      })

      const navbarSnapshotClasses = computed(() => {
        return {
          'v-btn--active': /^\/snapshot/.test(context.root.$route.path)
        }
      })

      const dense = computed(() => {
        return context.root.$vuetify.breakpoint.mdAndDown || scrolledDown.value
      })

      const logoSize = computed(() => {
        if (dense) {
          return '32'
        } else {
          return '48'
        }
      })

      const wasConnected = computed(() => {
        return store.state.connection.wasConnected
      })

      const dark = computed(() => {
        return store.state.theme.dark
      })

      return {
        navbarSnapshotClasses,
        dense,
        logoSize,
        wasConnected,
        dark
      }
    }
  }
</script>
