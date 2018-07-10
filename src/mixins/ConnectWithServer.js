import ConnectionService from '../services/elasticsearch/ConnectionService'

const ConnectWithServer = {
  methods: {
    connectWithServer () {
      let connectionService = new ConnectionService(this.$store.state.connection.elasticsearchHost)
      return connectionService.getAdapter()
        .then(adapter => this.$store.commit('connection/setElasticsearchAdapter', adapter))
    }
  }
}

export default ConnectWithServer
