<template>
  <v-form class="d-flex align-center" @submit.prevent="testConnection">
    <v-toolbar-items class="mr-2">
      <v-text-field id="toolbarHost"
                    v-model="elasticsearchHost"
                    title="Host"
                    label="Host"
                    type="text"
                    class="v-text-field--condensed"
                    solo
                    append-icon="clear"
                    @keyup.ctrl.enter="connectAndEmitHostChangedIfTestSuccess"
                    @click:append="resetElasticsearchHost"/>
    </v-toolbar-items>
    <v-btn :loading="testLoading"
           :disabled="hostValid !== true"
           type="submit">
      Test connection
    </v-btn>

    <v-btn v-if="isConnected && testSuccess && isSameHost"
           :loading="connectLoading"
           type="button"
           @click.native="connectAndEmitHostChangedIfTestSuccess">
      Reconnect
    </v-btn>
    <v-btn v-else
           :disabled="!testSuccess"
           :loading="connectLoading"
           type="button"
           @click.native="connectAndEmitHostChangedIfTestSuccess">Connect
    </v-btn>
  </v-form>
</template>

<script>
  import ConnectBase from '@/components/Setup/ConnectBase'
  import IsConnected from '../../mixins/IsConnected'

  export default {
    name: 'test-and-connect-toolbar',
    extends: ConnectBase,
    mixins: [
      IsConnected
    ],
    data () {
      return {
        testSuccess: true
      }
    },
    computed: {
      isSameHost () {
        return this.$store.state.connection.elasticsearchHost ===
          this.$store.state.connection.elasticsearchAdapter.client.transport._config.host
      }
    },
    methods: {
      connectAndEmitHostChangedIfTestSuccess () {
        if (this.testSuccess) {
          this.connectAndEmitHostChanged()
        }
      },
      connectAndEmitHostChanged () {
        this.connectLoading = true
        this.connectWithServer()
          .then(() => {
            this.connectLoading = false
            this.showSuccessSnackbar({text: 'Successfully connected.'})
            this.$emit('hostChanged')
          })
          .catch(error => {
            this.connectLoading = false
            this.$store.commit('connection/setErrorState', error)
            this.showErrorSnackbar({text: 'Error: could not connect.'})
          })
      }
    }
  }
</script>
