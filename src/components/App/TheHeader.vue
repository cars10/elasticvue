<template>
  <v-app-bar :dense="dense" app>
    <router-link class="mt-2" to="/">
      <img v-if="this.$store.state.theme.dark" :height="logoSize" :width="logoSize"
           alt="Logo" src="../../../public/images/logo/white_96.png">
      <img v-else :height="logoSize" :width="logoSize" alt="Logo" src="../../../public/images/logo/blue_96.png">
    </router-link>
    <v-toolbar-title class="mr-6 ml-4 hidden-md-and-down">
      <router-link to="/">
        Elasticvue
      </router-link>
    </v-toolbar-title>

    <div v-if="wasConnected" id="navbar_cluster_health" class="inline-block mt-1 hidden-xs-only">
      <v-btn small class="ma-0 hidden-sm-and-down" icon title="Disconnect and reset" @click="reset">
        <v-icon small>mdi-link</v-icon>
      </v-btn>
      <span :title="apiVersion" class="mx-1 hidden-sm-and-down">{{clusterInfo}}</span>
      <v-chip :class="clusterHealthClasses" small title="Health">{{clusterHealth}}</v-chip>
      <reload-button id="header-reload-button" :action="getHealth" :default-setting="5" title="Reload status"/>
    </div>

    <div class="flex-grow-1"/>

    <v-toolbar-items>
      <v-btn id="navbar_home" exact text to="/">Home</v-btn>
      <v-btn id="navbar_nodes" text to="/nodes">Nodes</v-btn>
      <v-btn id="navbar_indices" text to="/indices">Indices</v-btn>
      <v-btn id="navbar_search" text to="/search">Search</v-btn>

      <v-menu offset-y>
        <template v-slot:activator="{on}">
          <v-btn id="navbar_query" :class="navbarQueryClasses" text v-on="on">
            Query
            <v-icon>mdi-menu-down</v-icon>
          </v-btn>
        </template>

        <v-list>
          <v-list-item id="navbar_query_rest" to="/query/rest">
            <v-list-item-content>
              <v-list-item-title>
                REST
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item id="navbar_query_api_browser" to="/query/api_browser">
            <v-list-item-content>
              <v-list-item-title>
                API BROWSER
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-menu>

      <v-btn id="navbar_snapshots" text to="/snapshots">Snapshots</v-btn>
      <v-btn id="navbar_utilities" text to="/utilities">Utilities</v-btn>
    </v-toolbar-items>
  </v-app-bar>
</template>

<script>
  import ConnectionStatus from '@/mixins/ConnectionStatus'
  import ReloadButton from '@/components/shared/ReloadButton'
  import Request from '@/mixins/Request'
  import { BASE_URI, CONNECTION_STATES, LOCALSTORAGE_KEY } from '@/consts'
  import { truncate, urlWithoutCredentials } from '@/helpers'

  export default {
    name: 'app-header',
    components: {
      ReloadButton
    },
    mixins: [
      ConnectionStatus,
      Request
    ],
    data () {
      return {
        drawer: false,
        clusterHealth: CONNECTION_STATES.UNKNOWN,
        scrolledDown: false
      }
    },
    computed: {
      clusterInfo () {
        return truncate(urlWithoutCredentials(this.$store.state.connection.elasticsearchHost), 50)
      },
      apiVersion () {
        return `Using api version ${this.$store.state.connection.apiVersion}`
      },
      clusterHealthClasses () {
        return [this.clusterHealth, 'ma-0']
      },
      navbarQueryClasses () {
        return {
          'v-btn--active': /^\/query/.test(this.$route.path)
        }
      },
      dense () {
        return this.$vuetify.breakpoint.mdAndDown || this.scrolledDown
      },
      logoSize () {
        if (this.dense) {
          return '32'
        } else {
          return '48'
        }
      }
    },
    created () {
      if (this.wasConnected) this.getHealth()
      if (typeof window !== 'undefined') window.addEventListener('scroll', this.setScrolledDown)
    },
    destroyed () {
      if (typeof window !== 'undefined') window.removeEventListener('scroll', this.setScrolledDown)
    },
    methods: {
      setScrolledDown () {
        this.scrolledDown = window.pageYOffset > 0
      },
      getHealth () {
        this.callElasticsearch('clusterHealth')
          .then(result => {
            this.clusterHealth = result.status
          })
          .catch(() => {
            this.clusterHealth = CONNECTION_STATES.UNKNOWN
          })
      },
      reset () {
        localStorage.removeItem(LOCALSTORAGE_KEY)
        window.location.replace(BASE_URI)
      }
    }
  }
</script>
