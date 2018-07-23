<script>
  import ConnectWithServer from '../../mixins/ConnectWithServer'
  import ConnectionService from '../../services/elasticsearch/ConnectionService'

  export default {
    name: 'connect-base',
    mixins: [ConnectWithServer],
    data () {
      return {
        testError: false,
        testSuccess: false,
        testLoading: false,
        connectLoading: false,
        connectError: false,
        errorMessage: ''
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
          this.$store.commit('connection/setElasticsearchHost', value)
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
        this.testSuccess = false
        this.testError = false
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
          .catch((e) => {
            this.testLoading = false
            this.testSuccess = false
            this.testError = true
            if (e instanceof TypeError) {
              this.errorMessage = 'typerror'
            } else {
              this.errorMessage = 'randomError'
            }
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
      },
      connectIfTestSuccessfull () {
        if (this.testSuccess) {
          this.connect()
        }
      }
    }
  }
</script>
