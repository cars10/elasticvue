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

    <div v-if="wasConnected" class="inline-block mt-1">
      <v-icon small>{{connectionIcon}}</v-icon>
      <span class="mx-1">{{clusterInfo}}</span>
      <v-chip :class="clusterHealthClasses" title="Health" small>{{clusterHealth}}</v-chip>
      <reload-button id="header-reload-button" :action="getHealth" :default-setting="5"/>
    </div>

    <v-spacer/>

    <v-toolbar-items>
      <v-btn id="navbar_home" flat to="/" exact>Home</v-btn>
      <v-btn id="navbar_nodes" flat to="/nodes">Nodes</v-btn>
      <v-btn id="navbar_indices" flat to="/indices">Indices</v-btn>
      <v-btn id="navbar_search" flat to="/search">Search</v-btn>

      <v-menu offset-y>
        <v-btn id="navbar_query" slot="activator" flat>
          Query
          <v-icon>arrow_drop_down</v-icon>
        </v-btn>

        <v-list>
          <v-list-tile @click="$router.push('/query/rest')">
            <v-list-tile-content>
              <v-list-tile-title>
                REST
              </v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>

          <v-list-tile @click="$router.push('/query/api_browser')">
            <v-list-tile-content>
              <v-list-tile-title>
                API BROWSER
              </v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-menu>

      <v-btn id="navbar_utilities" flat to="/utilities">Utilities</v-btn>
    </v-toolbar-items>
  </v-toolbar>
</template>

<script>
  import ConnectionStatus from '@/mixins/ConnectionStatus'
  import ReloadButton from '@/components/shared/ReloadButton'
  import Request from '@/mixins/Request'
  import { CONNECTION_STATES } from '../../consts'

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
        return `${this.$store.state.connection.elasticsearchHost}`
      },
      connectionIcon () {
        if (this.isConnected) {
          return 'link'
        } else {
          return 'link_off'
        }
      },
      clusterHealthClasses () {
        return [this.clusterHealth, 'ma-0']
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
      }
    }
  }
</script>
