import ConnectService from '../services/elasticsearch/ConnectService'

const ConnectWithServer = {
  methods: {
    connectWithServer () {
      let connectService = new ConnectService(this.$store.state.connection.elasticsearchHost)
      connectService.connect().then(
        client => this.$store.commit('setElasticsearchClient', client),
        error => this.$store.commit('setErrorState', error)
      )
    }
  }
}

export default ConnectWithServer
