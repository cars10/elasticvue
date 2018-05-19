<template>
  <div v-if="isConnected() || wasConnected()">
    <slot></slot>
  </div>

  <div class="p3" v-else>
    <v-layout row wrap>
      <v-flex md8 offset-md2>
        <v-card>
          <v-card-title>
            <h1 class="headline">Connect</h1>
          </v-card-title>
          <v-divider></v-divider>

          <v-flex py-3>
            <connect></connect>
          </v-flex>

          <v-alert :type="alertType" :value="true" class="text-bigger">
            <p v-if="isErrorState"><strong>Could not connect.</strong></p>
            <p>Please make sure that your elasticsearch server is configured correctly.</p>
            To enable access from {{domain}} you have to add the following configurations to your <strong>elasticsearch.yml</strong>:

            <div>
              <!-- @formatter:off -->
<code class="code-block"><span class="code-comment"># allow CORS requests</span>
http.cors.enabled: true
<span class="code-comment"># allow CORS requests from {{domain}}</span>
http.cors.allow-origin: {{domain}}

<span class="code-comment"># Alternatively you can pass a regex as the allowed origins</span>
<span class="code-comment" style="display: block"># http.cors.allow-origin: /https?:\/\/{{hostname}}(:[0-9]+)?)/</span></code>
            <!-- @formatter:on -->
            </div>
          </v-alert>
        </v-card>
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
  import Connect from '@/components/shared/Connect'
  import IsConnected from '../../mixins/IsConnected'
  import { CONNECTION_STATES } from '../../consts'

  export default {
    name: 'ContentOrConnect',
    computed: {
      isErrorState () {
        return (this.$store.state.connection.status === CONNECTION_STATES.ERROR)
      },
      domain () {
        return window.location.origin
      },
      hostname () {
        return window.location.hostname
      },
      alertType () {
        return this.isErrorState ? 'error' : 'info'
      }
    },
    components: {
      Connect
    },
    mixins: [IsConnected]
  }
</script>
