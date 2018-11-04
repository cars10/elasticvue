<template>
  <v-form class="d-flex align-center" @submit.prevent="testConnection">
    <v-toolbar-items class="mr-2">
      <v-text-field id="toolbar_host"
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
    <v-btn id="toolbar_test_connection_button"
           :loading="testLoading"
           :disabled="!hostValid"
           type="submit">
      Test
    </v-btn>

    <v-btn v-if="isConnected && testSuccess && hostEqual"
           id="toolbar_reconnect_button"
           :loading="connectLoading"
           type="button"
           @click.native="connectAndEmitHostChangedIfTestSuccess">
      Reconnect
    </v-btn>
    <v-btn v-else
           id="toolbar_connect_button"
           :disabled="!testSuccess"
           :loading="connectLoading"
           type="button"
           @click.native="connectAndEmitHostChangedIfTestSuccess">Connect
    </v-btn>
  </v-form>
</template>

<script>
  import ConnectBase from '@/components/Setup/ConnectBase'
  import ConnectionStatus from '@/mixins/ConnectionStatus'

  export default {
    name: 'test-and-connect-toolbar',
    extends: ConnectBase,
    mixins: [
      ConnectionStatus
    ],
    data () {
      return {
        testSuccess: true
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
            this.hostEqual = true
            this.showSuccessSnackbar({ text: 'Successfully connected.' })
            this.$emit('hostChanged')
          })
          .catch(error => {
            this.connectLoading = false
            this.showErrorSnackbar({ text: 'Error: could not connect.', additionalText: error.message })
          })
      }
    }
  }
</script>
