import ConnectionService from '../services/elasticsearch/ConnectionService'

const ElasticsearchAdapter = {
  methods: {
    getElasticsearchAdapter () {
      if (this.$store.state.connection.elasticsearchAdapter !== null) {
        return Promise.resolve(this.$store.state.connection.elasticsearchAdapter)
      } else {
        let connectionService = new ConnectionService(this.$store.state.connection.elasticsearchHost)
        return connectionService.getAdapter().then(
          adapter => {
            this.$store.commit('connection/setElasticsearchAdapter', adapter)
            return adapter
          },
          error => this.$store.commit('connection/setErrorState', error)
        )
      }
    },
    simpleRequest (options) {
      this.getElasticsearchAdapter()
        .then(adapter => adapter[options.method](options.args))
        .then(body => {
          if (typeof options.callback === 'function') options.callback.call(body)
          this.showSuccessSnackbar({
            text: options.text,
            additionalText: JSON.stringify(body)
          })
        })
        .catch(error => this.$store.commit('connection/setErrorState', error))
    }
  }
}

export default ElasticsearchAdapter
