import ElasticsearchAdapter from '../ElasticsearchAdapter'

let elasticsearch = require('elasticsearch')

export default class ConnectService {
  host
  apiVersion

  constructor (host, version) {
    this.host = host
    this.version = version
  }

  /**
   * Creates a new elasticsearch client and tries to ping it.
   * Promise resolves to the client and rejects with an error.
   * @returns {Promise}
   */
  connect () {
    let client = new elasticsearch.Client({
      host: this.host,
      apiVersion: this.version// ,
      // log: 'trace'
    })

    let adapter = new ElasticsearchAdapter(client)

    return new Promise((resolve, reject) => {
      adapter.ping().then(
        body => body === true ? resolve(client) : reject(body),
        error => reject(error)
      )
    })
  }
}
