import ElasticsearchAdapter from '../ElasticsearchAdapter'
import ElasticsearchVersionService from './ElasticsearchVersionService'
import Elasticsearch from 'elasticsearch'

export default class ConnectionService {
  constructor (host) {
    this.host = host
    this.client = null
  }

  testConnection () {
    return this.buildClient()
      .then(() => {
        let adapter = new ElasticsearchAdapter(this.client)
        return adapter.testAdapter()
      })
  }

  buildClient () {
    return new ElasticsearchVersionService(this.host).getApiVersion()
      .then(version => {
        this.client = new Elasticsearch.Client({
          host: this.host,
          apiVersion: version,
          log: false // process.env.NODE_ENV === 'production' ? false : 'trace'
        })
      })
  }

  getAdapter () {
    return new Promise((resolve, reject) => {
      this.buildClient()
        .then(() => {
          let adapter = new ElasticsearchAdapter(this.client)
          adapter.testAdapter().then(response => response === true ? resolve(adapter) : reject(response))
        })
    })
  }
}
