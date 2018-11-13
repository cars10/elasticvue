import ElasticsearchAdapter from '../ElasticsearchAdapter'
import ElasticsearchVersionService from './ElasticsearchVersionService'

export default class ConnectionService {
  constructor (host) {
    this.host = host
  }

  async testConnection () {
    try {
      let client = await this.buildClient()
      let adapter = new ElasticsearchAdapter(client)
      await adapter.ping()
      await adapter.search({ size: 0 })
      return Promise.resolve(adapter)
    } catch (e) {
      return Promise.reject(e)
    }
  }

  async buildClient () {
    let versionService = new ElasticsearchVersionService(this.host)
    let apiVersion = await versionService.getApiVersion().catch(e => {
      throw new TypeError(e)
    })

    return import(/* webpackChunkName: "elasticsearch-js" */ 'elasticsearch').then(Elasticsearch => {
      return new Elasticsearch.Client({
        host: this.host,
        apiVersion: apiVersion,
        log: false // process.env.NODE_ENV === 'production' ? false : 'trace'
      })
    })
  }

  async getAdapter () {
    let client = await this.buildClient()
    return new ElasticsearchAdapter(client)
  }
}
