<template>
  <v-toolbar :dense="this.$vuetify.breakpoint.sm">
    <router-link to="/" class="mt-2">
      <img v-if="this.$store.state.theme.dark" src="../../../public/images/logo/logo_48_white.png" alt="Logo">
      <img v-else src="../../../public/images/logo/logo_48_blue.png" alt="Logo">
    </router-link>
    <v-toolbar-title class="mr-4 ml-3 hidden-xs-only">
      <router-link to="/">
        Elasticvue
      </router-link>
    </v-toolbar-title>

    <div v-if="wasConnected" id="navbar_cluster_health" class="inline-block mt-1">
      <v-btn icon class="ma-0" title="Disconnect and reset" @click="reset">
        <v-icon small>mdi-link</v-icon>
      </v-btn>
      <span class="mx-1" :title="apiVersion">{{clusterInfo}}</span>
      <v-chip :class="clusterHealthClasses" title="Health" small>{{clusterHealth}}</v-chip>
      <reload-button id="header-reload-button" :action="getHealth" :default-setting="5"/>
    </div>

    <v-spacer/>

    <v-toolbar-items>
      <v-btn id="navbar_home" text to="/" exact>Home</v-btn>
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
  </v-toolbar>
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
        clusterHealth: CONNECTION_STATES.UNKNOWN
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
      }
    },
    created () {
      if (this.wasConnected) this.getHealth()
    },
    methods: {
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
