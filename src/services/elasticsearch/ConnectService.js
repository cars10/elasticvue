import ElasticsearchAdapter from '../ElasticsearchAdapter'
import { mapElasticsearchApiVersion } from '../../helpers/index'

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
    let mappedVersion = mapElasticsearchApiVersion(apiVersion)

    let client = new elasticsearch.Client({
      host: this.host,
      apiVersion: mappedVersion,
      log: false // process.env.NODE_ENV === 'production' ? false : 'trace'
    })

    let adapter = new ElasticsearchAdapter(client)

    return new Promise((resolve, reject) => {
      adapter.ping().then(
        body => body === true ? resolve(client) : reject(body),
        error => reject(error)
      )
    })
  }

  /**
   * getApiVersion
   * Returns the api version of a running elasticsearch at +host+
   * @returns {Promise<version>}
   */
  async getApiVersion () {
    try {
      let response = await fetch(this.host)
      let json = await response.json()
      return json.version.number.slice(0, 3)
    } catch (error) {
      throw Error(error)
    }
  }
}
