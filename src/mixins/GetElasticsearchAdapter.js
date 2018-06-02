import ConnectionService from '../services/elasticsearch/ConnectionService'

const GetElasticsearchAdapter = {
  methods: {
    getElasticsearchAdapter () {
      if (this.$store.state.connection.elasticsearchAdapter !== null) {
        return Promise.resolve(this.$store.state.connection.elasticsearchAdapter)
      } else {
        let connectionService = new ConnectionService(this.$store.state.connection.elasticsearchHost)
        return connectionService.getAdapter().then(
          adapter => {
            this.$store.commit('setElasticsearchAdapter', adapter)
            return adapter
          },
          error => this.$store.commit('setErrorState', error)
        )
      }
    }
  }
}

export default GetElasticsearchAdapter
