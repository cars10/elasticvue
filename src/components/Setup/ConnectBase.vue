<template>
  <!-- we define a template in each component that extends this one -->
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
        connectLoading: false,
        connectError: false,
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
        this.connectLoading = true
        this.connectWithServer()
          .then(() => {
            this.connectLoading = false
            this.connectError = false
            this.showSuccessSnackbar({text: 'Successfully connected.'})
          })
          .catch(() => {
            this.connectLoading = false
            this.connectError = true
            this.showErrorSnackbar({text: 'Error: could not connect.'})
          })
      }
    },
    mixins: [ConnectWithServer]
  }
</script>
