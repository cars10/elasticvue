<template>
  <v-form class="d-flex align-center" @submit.prevent="testConnection">
    <v-toolbar-items class="mr-2">
      <v-text-field title="Host"
                    label="Host"
                    id="toolbarHost"
                    type="text"
                    class="v-text-field--condensed"
                    solo
                    v-model="elasticsearchHost"
                    append-icon="clear"
                    @keyup.ctrl.enter="connectAndEmitHostChangedIfTestSuccess"
                    @click:append="resetElasticsearchHost"></v-text-field>
    </v-toolbar-items>
    <v-btn type="submit"
           :loading="testLoading"
           :disabled="hostValid !== true">
      Test connection
    </v-btn>

    <v-btn v-if="isConnected && testSuccess && isSameHost"
           type="button"
           :loading="connectLoading"
           @click.native="connectAndEmitHostChangedIfTestSuccess">
      Reconnect
    </v-btn>
    <v-btn v-else
           :disabled="!testSuccess"
           type="button"
           :loading="connectLoading"
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
            this.$store.commit('setErrorState', error)
            this.showErrorSnackbar({text: 'Error: could not connect.'})
          })
      }
    },
    mixins: [
      IsConnected
    ]
  }
</script>
