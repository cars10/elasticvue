import ConnectService from '../services/elasticsearch/ConnectService'
import ElasticsearchAdapter from '../services/ElasticsearchAdapter'

const ConnectMixin = {
  methods: {
    connectWithClient () {
      let connectService = new ConnectService(this.$store.state.connection.elasticsearchHost)
      connectService.connect().then(
        client => {
          this.$store.commit('setElasticsearchClient', client)
          let adapter = new ElasticsearchAdapter(client)
          adapter.getCatIndices().then(
            body => this.$store.commit('setIndices', body),
            error => this.$store.commit('setErrorState', error)
          )
        },
        error => this.$store.commit('setErrorState', error)
      )
    }
  }
}

export default ConnectMixin
