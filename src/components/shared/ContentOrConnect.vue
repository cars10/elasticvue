<template>
  <div v-if="isConnected()">
    <slot></slot>
  </div>

  <div class="p3" v-else>
    <v-container grid-list-md>
      <v-layout row wrap>
        <v-flex xs8 offset-xs2>
          <v-card>
            <v-card-title><h2>Connect</h2></v-card-title>
            <v-divider></v-divider>
            <v-flex py-3>
              <connect></connect>
            </v-flex>
          </v-card>
        </v-flex>

        <v-flex xs8 offset-xs2>
          <v-alert :type="isErrorState ? 'error' : 'info'" :value="true" class="text-bigger">
            <p v-if="isErrorState"><strong>Could not connect.</strong></p>
            <p>Please make sure that your elasticsearch server is configured correctly.</p>
            To enable access from {{domain}} you have to make the following configurations in your <strong>elasticsearch.yml</strong>:
            <ul class="pl-3 mb-1">
              <li>to allow CORS requests, add <code>http.cors.enabled: true</code></li>
              <li>to allow requests from {{domain}}, add <code>http.cors.allow-origin: {{domain}}</code></li>
            </ul>

            Alternatively you can pass a regex as the allowed origins, for example
            <code>http.cors.allow-origin: /https?:\/\/{{hostname}}(:[0-9]+)?)/</code>
          </v-alert>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
  import Connect from '@/components/shared/Connect'
  import IsConnected from '../../mixins/IsConnected'
  import { CONNECTION_STATES } from '../../consts'

  export default {
    components: {
      Connect
    },
    mixins: [IsConnected],
    computed: {
      isErrorState () {
        return (this.$store.state.connection.status === CONNECTION_STATES.ERROR)
      },
      domain () {
        return window.location.origin
      },
      hostname () {
        return window.location.hostname
      }
    }
  }
</script>
