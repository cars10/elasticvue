import ConnectionService from '../services/elasticsearch/ConnectionService'

const ConnectWithServer = {
  methods: {
    connectWithServer () {
      let connectionService = new ConnectionService(this.$store.state.connection.elasticsearchHost)
      return connectionService.getAdapter().then(() => this.$store.commit('connection/setConnected'))
    }
  }
}

export default ConnectWithServer
