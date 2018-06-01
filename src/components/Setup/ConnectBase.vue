<template>
  <v-form v-on:submit.prevent="testConnection">
    <v-flex d-inline-flex>
      <v-text-field title="Host"
                    label="Host"
                    id="host"
                    type="text"
                    autofocus
                    v-model="elasticsearchHost"
                    :rules="[hostValid]"
                    append-icon="clear"
                    :append-icon-cb="resetElasticsearchHost"></v-text-field>
    </v-flex>
    <v-btn type="submit"
           :color="testConnectionColor"
           :loading="testLoading"
           :disabled="hostValid !== true">
      Test connection
    </v-btn>

    <v-btn :disabled="!testSuccess" color="success" type="button" @click.native="connect">Connect</v-btn>
  </v-form>
</template>

<script>
  import ConnectWithServer from '../../mixins/ConnectWithServer'
  import ConnectionService from '../../services/elasticsearch/ConnectionService'

  export default {
    name: 'connect-base',
    data () {
      return {
        testError: false,
        testSuccess: false,
        testLoading: false,
        testErrorCode: 0
      }
    },
    computed: {
      elasticsearchHost: {
        get () {
          return this.$store.state.connection.elasticsearchHost
        },
        set (value) {
          this.testError = false
          this.testSuccess = false
          this.testLoading = false
          this.$store.commit('setElasticsearchHost', value)
        }
      },
      testConnectionColor () {
        return this.testError ? 'error' : 'primary'
      },
      hostValid () {
        return this.elasticsearchHost.match(/https?:\/\//) ? true : 'Host most contain a valid scheme'
      }
    },
    methods: {
      resetElasticsearchHost () {
        this.elasticsearchHost = ''
      },
      testConnection () {
        this.testLoading = true
        new ConnectionService(this.$store.state.connection.elasticsearchHost).testConnection()
          .then(() => {
            this.testLoading = false
            this.testSuccess = true
            this.testError = false
            this.showSuccessSnackbar({
              text: 'Test successfull',
              additionalText: 'You cluster is reachable and configured correctly.'
            })
          })
          .catch(() => {
            this.testLoading = false
            this.testSuccess = false
            this.testError = true
            this.showErrorSnackbar({text: 'Error: could not connect.'})
          })
      },
      connect () {
        this.connectWithServer().then(this.showSuccessSnackbar({text: 'Successfully connected.'}))
      }
    },
    mixins: [ConnectWithServer]
  }
</script>
