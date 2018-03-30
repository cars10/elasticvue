import ElasticsearchAdapter from '../services/ElasticsearchAdapter'

const GetElasticsearchAdapter = {
  methods: {
    getElasticsearchAdapter () {
      if (this.$store.state.connection.elasticsearchAdapter !== null) {
        return this.$store.state.connection.elasticsearchAdapter
      } else if (this.$store.state.connection.elasticsearchClient !== null) {
        let adapter = new ElasticsearchAdapter(this.$store.state.connection.elasticsearchClient)
        this.$store.commit('setElasticsearchAdapter', adapter)
        return adapter
      }
    }
  }
}

export default GetElasticsearchAdapter
