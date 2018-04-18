<template>
  <v-card>
    <v-card-title>
      <h2>Node Information</h2>
      <reload-button :action="loadClientInfo"></reload-button>
    </v-card-title>
    <v-divider></v-divider>

    <content-or-loading :loading="loading">
      <v-list dense>
        <v-list-tile class="list__tile--selectable" v-for="key in Object.keys(clientInformation)" :key="key">
          <v-list-tile-content>{{key}}</v-list-tile-content>
          <v-list-tile-content class="align-end">{{clientInformation[key]}}</v-list-tile-content>
        </v-list-tile>
      </v-list>
    </content-or-loading>
  </v-card>
</template>

<script>
  import ReloadButton from '@/components/shared/ReloadButton'
  import { flattenObject } from '../../helpers/utilities'

  export default {
    data () {
      return {
        clientInformation: {},
        loading: false
      }
    },
    components: {
      ReloadButton
    },
    created () {
      this.loadClientInfo()
    },
    methods: {
      loadClientInfo () {
        this.loading = true
        this.getElasticsearchAdapter().then(adapter => adapter.getClientInfo()).then(
          body => {
            this.clientInformation = flattenObject(body, true, true)
            this.loading = false
          }
        ).catch(error => this.$store.commit('setErrorState', error))
      }
    }
  }
</script>
