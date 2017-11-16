import ElasticsearchAdapter from '../ElasticsearchAdapter'

let elasticsearch = require('elasticsearch')

export default class ConnectService {
  constructor (host) {
    this.host = host
  }

  /**
   * Creates a new elasticsearch client and tries to ping it.
   * Promise resolves to the client and rejects with an error.
   * @returns {Promise}
   */
  async connect () {
    let apiVersion = await this.getApiVersion()

    let client = new elasticsearch.Client({
      host: this.host,
      apiVersion: apiVersion
    })

    let adapter = new ElasticsearchAdapter(client)

    return new Promise((resolve, reject) => {
      adapter.ping().then(
        body => body === true ? resolve(client) : reject(body),
        error => reject(error)
      )
    })
  }

  async getApiVersion () {
    try {
      let response = await fetch(this.host)
      let info = await response.json()
      return info.version.number.slice(0, 3)
    } catch (error) {
      throw Error(error)
    }
  }
}
