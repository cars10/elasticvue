import ElasticsearchAdapter from '../services/ElasticsearchAdapter'
import ConnectService from '../services/elasticsearch/ConnectService'

const GetElasticsearchAdapter = {
  methods: {
    getElasticsearchAdapter () {
      if (this.$store.state.connection.elasticsearchAdapter !== null) {
        return new Promise((resolve) => resolve(this.$store.state.connection.elasticsearchAdapter))
      } else {
        if (this.$store.state.connection.elasticsearchClient !== null) {
          let adapter = new ElasticsearchAdapter(this.$store.state.connection.elasticsearchClient)
          this.$store.commit('setElasticsearchAdapter', adapter)
          return new Promise((resolve) => resolve(adapter))
        } else {
          let connectService = new ConnectService(this.$store.state.connection.elasticsearchHost)
          return connectService.connect().then(
            client => {
              this.$store.commit('setElasticsearchClient', client)
              let adapter = new ElasticsearchAdapter(client)
              this.$store.commit('setElasticsearchAdapter', adapter)
              return adapter
            },
            error => this.$store.commit('setErrorState', error)
          )
        }
      }
    }
  }
}

export default GetElasticsearchAdapter
