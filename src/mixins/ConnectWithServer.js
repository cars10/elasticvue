import ConnectService from '../services/elasticsearch/ConnectService'

const ConnectWithServer = {
  methods: {
    connectWithServer (callback) {
      let connectService = new ConnectService(this.$store.state.connection.elasticsearchHost)
      connectService.connect().then(
        client => {
          this.$store.commit('setElasticsearchClient', client)
          callback()
        },
        error => this.$store.commit('setErrorState', error)
      )
    }
  }
}

export default ConnectWithServer
