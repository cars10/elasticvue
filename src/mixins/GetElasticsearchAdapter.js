import ConnectionService from '../services/elasticsearch/ConnectionService'

const GetElasticsearchAdapter = {
  methods: {
    getElasticsearchAdapter () {
      let connectionService = new ConnectionService(this.$store.state.connection.elasticsearchHost)
      return connectionService.getAdapter()
        .then(adapter => adapter)
        .catch(error => this.$store.commit('connection/setErrorState', error))
    }
  }
}

export default GetElasticsearchAdapter
