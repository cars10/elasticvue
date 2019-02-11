import ConnectionService from '../services/elasticsearch/ConnectionService'
import { showErrorSnackbar, showSuccessSnackbar } from '@/mixins/ShowSnackbar'

const ElasticsearchAdapterHelper = {
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
          }
        )
      }
    },
    elasticsearchRequest (options) {
      if (options.confirmMessage && options.confirmMessage.length !== 0) {
        if (confirm(options.confirmMessage)) {
          this.runRequest(options)
        }
      } else {
        this.runRequest(options)
      }
    },
    runRequest (options) {
      this.getElasticsearchAdapter()
        .then(adapter => adapter[options.method](options.methodParams))
        .then(body => {
          if (typeof options.callback === 'function') options.callback(body)
          if (options.growl) {
            showSuccessSnackbar({
              text: options.growl,
              additionalText: JSON.stringify(body)
            })
          }
        })
        .catch(error => showErrorSnackbar({ text: 'Error:', additionalText: error.message }))
    }
  }
}

export default ElasticsearchAdapterHelper
