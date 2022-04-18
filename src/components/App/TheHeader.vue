<template>
  <v-app-bar :dense="dense" app>
    <router-link aria-label="Home" class="mt-2" to="/">
      <img v-if="dark" :height="logoSize" :width="logoSize"
           alt="Logo" src="../../../public/images/logo/white_96.png">
      <img v-else :height="logoSize" :width="logoSize" alt="Logo" src="../../../public/images/logo/blue_96.png">
    </router-link>
    <v-toolbar-title class="ml-3 hidden-md-and-down">
      <router-link aria-label="Home" to="/">
        Elasticvue
      </router-link>
    </v-toolbar-title>

    <div v-if="wasConnected" class="inline-block ml-3 hidden-xs-only">
      <instance-selection/>
    </div>

    <div class="flex-grow-1"/>

    <v-toolbar-items v-if="wasConnected">
      <v-btn id="navbar_home" exact text :to="{name: 'Home'}">
        {{ $t('app.header.navigation.home') }}
      </v-btn>
      <v-btn id="navbar_nodes" text :to="{name: 'Nodes'}">
        {{ $t('app.header.navigation.nodes') }}
      </v-btn>
      <v-btn id="navbar_shards" text :to="{name: 'Shards'}">
        {{ $t('app.header.navigation.shards') }}
      </v-btn>
      <v-btn id="navbar_indices" text :to="{name: 'Indices'}">
        {{ $t('app.header.navigation.indices') }}
      </v-btn>
      <v-btn id="navbar_search" text :to="{name: 'Search'}">{{ $t('app.header.navigation.search') }}</v-btn>
      <v-btn id="navbar_query_rest" text :to="{name: 'Rest'}">{{ $t('app.header.navigation.rest') }}</v-btn>

      <v-menu offset-y>
        <template v-slot:activator="{on}">
          <v-btn id="navbar_snapshots" v-on="on" :class="navbarSnapshotClasses" text>
            {{ $t('app.header.navigation.snapshots') }}
            <v-icon>mdi-menu-down</v-icon>
          </v-btn>
        </template>

        <v-list>
          <v-list-item id="navbar_snapshots_repositories" :to="{name: 'Repositories'}">
            <v-list-item-content>
              <v-list-item-title>
                {{ $t('app.header.navigation.repositories') }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item id="navbar_snapshots_snapshots" :to="{name: 'Snapshots'}">
            <v-list-item-content>
              <v-list-item-title>
                {{ $t('app.header.navigation.snapshots') }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-menu>

      <v-btn id="navbar_utilities" text :to="{name: 'Utilities'}">{{ $t('app.header.navigation.utilities') }}</v-btn>
      <v-btn id="navbar_settings" text :to="{name: 'Settings'}">
        <v-icon>mdi-cog</v-icon>
      </v-btn>
    </v-toolbar-items>
  </v-app-bar>
</template>

<script>
  import { computed, onBeforeUnmount, onMounted, ref } from '@vue/composition-api'
  import store from '@/store'
  import InstanceSelection from '@/components/ElasticsearchInstance/InstanceSelection'

  export default {
    name: 'app.header',
    components: {
      InstanceSelection
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
          'v-btn--active': /\/snapshot/.test(context.root.$route.path)
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
        return store.state.connection.activeInstanceIdx !== null
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
