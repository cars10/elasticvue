import ConnectionService from '../services/elasticsearch/ConnectionService'

const ConnectWithServer = {
  methods: {
    connectWithServer () {
      let connectionService = new ConnectionService(this.$store.state.connection.elasticsearchHost)
      return connectionService.getAdapter()
        .then(adapter => this.$store.commit('setElasticsearchAdapter', adapter))
        .catch(error => this.$store.commit('setErrorState', error))
    }
  }
}

export default ConnectWithServer
